import { Col, Row } from 'react-bootstrap'

import { useLoaderContext } from '@/contexts/Loader'
import { useToastContext } from '@/contexts/Toast'
import { useAuthRoles } from '@/hooks/services/Rules/Auth/useRoles'

import { ButtonIcon } from '@/components/Core/Buttons/ButtonIcon'
import { Td, Tr } from '@/components/Core/Table'
import { Paragraph } from '@/components/Core/Typography/Paragraph'

import { put } from '@/services/api/sermed-api/sermed-api'
import { convertIsoDateToPtBr } from '@/utils/date'

import { IUsers } from '@/hooks/services/Parameters/useUsers'
import { Tooltip } from '@/components/Core/Tooltip'

interface Props {
  data: IUsers
  onEdit: () => void
  onAddTeam: () => void
  onAddPermission: () => void
  onRefetch: () => void
}

export function UsersTable({
  data,
  onEdit,
  onRefetch,
  onAddTeam,
  onAddPermission
}: Props) {
  const { hasParametrizationsWriter } = useAuthRoles()
  const { showLoader, hideLoader } = useLoaderContext()
  const { addToast, handleApiRejection } = useToastContext()

  async function handleOnActivate(uuid: string) {
    try {
      showLoader()

      const { data } = await put(`parametrizations/users/${uuid}`, {
        status: 'active'
      })

      if (data) {
        onRefetch()

        addToast({
          type: 'success',
          title: 'Sucesso!',
          description: 'Usuário ativado com sucesso!'
        })
      }
    } catch {
      handleApiRejection()
    } finally {
      hideLoader()
    }
  }

  async function handleOnInactivate(uuid: string) {
    try {
      showLoader()

      const { data } = await put(`parametrizations/users/${uuid}`, {
        status: 'inactive'
      })

      if (data) {
        onRefetch()

        addToast({
          type: 'success',
          title: 'Sucesso!',
          description: 'Usuário inativado com sucesso!'
        })
      }
    } catch {
      handleApiRejection()
    } finally {
      hideLoader()
    }
  }

  return (
    <Tr>
      <Td>
        <Row className="justify-content-center">
          <Col xs="auto">
            <ButtonIcon
              appearance={`${data.status === 'active' ? 'filled' : 'outlined'}`}
              size="md"
              icon={`${data.status === 'active' ? 'toggle_on' : 'toggle_off'}`}
              disabled={!hasParametrizationsWriter()}
              onClick={() => {
                data.status === 'active'
                  ? handleOnInactivate(data.uuid)
                  : handleOnActivate(data.uuid)
              }}
            />
          </Col>
        </Row>
      </Td>

      <Td>
        <Paragraph size="sm">{data.name}</Paragraph>
      </Td>

      <Td>
        <Paragraph size="sm">{convertIsoDateToPtBr(data.created_at)}</Paragraph>
      </Td>

      <Td showOnHover={true}>
        <div className="d-flex justify-content-center">
          <Tooltip title="Detalhes" place="top">
            <ButtonIcon size="sm" icon="open_in_new" onClick={() => onEdit()} />
          </Tooltip>

          <Tooltip title="Atribuir Equipe" place="top-start">
            <ButtonIcon
              disabled={data.resignation_date !== null}
              size="sm"
              icon="group_add"
              onClick={() => onAddTeam()}
            />
          </Tooltip>

          <Tooltip title="Atribuir Permissões" place="top-start">
            <ButtonIcon
              disabled={data.resignation_date !== null}
              size="sm"
              icon="admin_panel_settings"
              onClick={() => onAddPermission()}
            />
          </Tooltip>
        </div>
      </Td>
    </Tr>
  )
}
