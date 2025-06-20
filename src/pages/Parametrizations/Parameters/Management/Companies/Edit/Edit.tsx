import { useCallback, useEffect, useState } from 'react'

import { useLoaderContext } from '@/contexts/Loader'
import { useToastContext } from '@/contexts/Toast'
import { useAuthRoles } from '@/hooks/services/Rules/Auth/useRoles'

import { get, put } from '@/services/api/sermed-api/sermed-api'

import { Col, Row } from 'react-bootstrap'

import { Modal } from '@/components/Core/Modal'
import { Icon } from '@/components/Core/Icons/Icon'
import { Subtitle } from '@/components/Core/Typography/Subtitle'
import { Button } from '@/components/Core/Buttons/Button'

import { cepMask, cnpjMask, removeMask } from '@/utils/masks'
import { CompanyRegisterForm } from '../components/RegisterForm'

import { ICompanyRegisterForm } from '../components/RegisterForm/RegisterForm.form'

interface Props {
  uuid: string
  onClose: (hasChanges: boolean) => void
}

export function EditCompany({ uuid, onClose }: Props) {
  const { hasParametrizationsWriter } = useAuthRoles()
  const { showLoader, hideLoader } = useLoaderContext()
  const { addToast, handleApiRejection } = useToastContext()

  const [showModal, setShowModal] = useState(false)
  const [readOnly, setReadOnly] = useState(true)

  const [initialValues, setInitialValues] =
    useState<ICompanyRegisterForm | null>(null)

  const fetchData = useCallback(
    async (uuid: string) => {
      try {
        const {
          data: { data }
        } = await get(`/parametrizations/companies/${uuid}`)

        const {
          companyName,
          companyCnpj,
          zipCode,
          streetName,
          streetNumber,
          complement,
          neighborhood,
          city,
          state,
          status
        } = data

        setInitialValues({
          companyName,
          companyCnpj: cnpjMask(companyCnpj),
          zipCode: cepMask(zipCode),
          streetName,
          streetNumber,
          complement,
          neighborhood,
          city,
          state,
          status
        })
      } catch {
        handleApiRejection()
        onClose(false)
      }
    },
    [handleApiRejection, onClose]
  )

  useEffect(() => {
    if (initialValues === null && uuid) {
      setShowModal(true)
      setReadOnly(true)

      fetchData(uuid)
    }
  }, [initialValues, uuid, fetchData])

  function handleOnCancel() {
    setShowModal(false)
    setReadOnly(true)
    setInitialValues(null)

    onClose(false)
  }

  async function handleOnSubmit(formValues: ICompanyRegisterForm) {
    try {
      showLoader()

      const { data, message } = await put(
        `/parametrizations/companies/${uuid}`,
        {
          ...formValues,
          companyCnpj: removeMask(formValues.companyCnpj),
          zipCode: removeMask(formValues.zipCode)
        }
      )

      if (data) {
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: 'O cadastro da Empresa foi editado.'
        })

        setShowModal(false)
        setReadOnly(true)
        setInitialValues(null)

        onClose(true)
      }

      if (message) {
        addToast({
          type: 'warning',
          title: 'Ooops',
          description: message
        })
      }
    } catch {
      handleApiRejection()
    } finally {
      hideLoader()
    }
  }

  return (
    <Modal visible={showModal} onClose={() => handleOnCancel()}>
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <div className="d-flex align-items-center gap-2">
            <Icon icon="edit" />

            <Subtitle size="sm">Editar Empresa</Subtitle>
          </div>
        </Col>

        <Col>
          <Button
            type="button"
            styles="tertiary"
            icon="edit"
            onClick={() => setReadOnly(readOnly => !readOnly)}
            disabled={
              !initialValues || !readOnly || !hasParametrizationsWriter()
            }
          >
            {`${readOnly ? 'Alterar' : 'Alterando...'}`}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <CompanyRegisterForm
            mode="edit"
            initialValues={initialValues}
            readOnly={readOnly}
            onCancel={() => handleOnCancel()}
            onSubmit={values => handleOnSubmit(values)}
          />
        </Col>
      </Row>
    </Modal>
  )
}
