// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { FormControl } from '@mui/material'
import { Grid, Switch } from '@mui/material'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from 'src/hooks/useApi'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { checkValidation } from './utils'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const dataTemplate = {
  firstName: '',
  lastName: '',
  imageUrl: '',
  email: '',
  phoneNumber: '',
  isActive: '',
  userRoles: []
}

// ! start

const AddRoleDrawer = ({ open, toggle, data }) => {
  const [selectedRoles, setSelectedRole] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [userData, setUserData] = useState(dataTemplate)
  const queryClient = useQueryClient()

  const { data: rolesList } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles/roles.getlistofrolesasync')
  })

  const mutation = useMutation({
    mutationKey: ['addNewRole'],
    mutationFn: data => api.post('/roles/roles.createroleasync', data),
    onSuccess: data => {
      queryClient.invalidateQueries(['roles'])
      reset()
      toggle()
    },
    onError: errors => {
      toggle()
      toast.error(JSON.parse(errors.response.data).messages[0] || 'Something went wrong')
      console.log(errors)
    }
  })

  // ! image handling

  const [image, setImage] = useState('')
  const [localImageUrl, setLoacalImageUrl] = useState('')

  useEffect(() => {
    if (image) {
      setLoacalImageUrl(URL.createObjectURL(image))
    } else {
      setLoacalImageUrl(null)
    }
  }, [image])

  // ! set initial data

  useEffect(() => {
    if (data) {
      setUserData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        imageUrl: data.imageUrl,
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        isActive: data.isActive || '',
        userRoles: data.roles || ''
      })
      setSelectedRole(data.roles)
    }
  }, [data])

  const onSubmit = data => {
    // mutation.mutate({ name: data.roleName, description: data.roleDescription })
  }

  // ! role add and remove
  function handleRoleChange(newItems) {
    let freshItems = []
    newItems.forEach(item => {
      const existing = freshItems.find(el => el.roleId === item.roleId)
      if (!existing?.roleId) {
        freshItems = [...freshItems, item]
      }
    })
    setSelectedRole(freshItems)
  }

  function handleRoleRemove(roleId) {
    setSelectedRole(p => p.filter(el => el.roleId !== roleId))
  }

  useEffect(() => {
    console.log(selectedRoles)
  }, [selectedRoles])

  //! validation errors
  useEffect(() => {
    const errorMsg = checkValidation(userData)
    setErrorMsg(errorMsg)
  }, [userData, selectedRoles])

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={toggle}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>Edit User</Typography>
        <IconButton
          size='small'
          onClick={() => toggle()}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <div className=' flex items-center justify-start gap-2 flex-col py-6'>
          {localImageUrl ? (
            <CustomAvatar src={localImageUrl} sx={{ mr: 2.5, width: 80, height: 80 }} />
          ) : (
            <CustomAvatar
              skin='light'
              sx={{
                mr: 2.5,
                width: 80,
                height: 80,
                fontWeight: 500,
                fontSize: theme => theme.typography.body1.fontSize
              }}
            ></CustomAvatar>
          )}

          <input type='file' id='userImage' className='hidden' onChange={e => setImage(e.target.files[0])} />

          <Button
            type='submit'
            variant='contained'
            onClick={() => document.getElementById('userImage').click()}
            sx={{ mr: 3 }}
          >
            Upload
          </Button>
        </div>
      </Box>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <Box sx={{ my: 4 }}>
          <FormControl fullWidth>
            <CustomTextField
              fullWidth
              label='First Name'
              value={userData.firstName}
              onChange={e => setUserData(p => ({ ...p, firstName: e.target.value }))}
              placeholder='Enter first name'
            />
          </FormControl>
        </Box>

        <Box sx={{ my: 4 }}>
          <FormControl fullWidth>
            <CustomTextField
              fullWidth
              label='Last Name'
              value={userData.lastName}
              onChange={e => setUserData(p => ({ ...p, lastName: e.target.value }))}
              placeholder='Enter last name'
            />
          </FormControl>
        </Box>

        <Box sx={{ my: 4 }}>
          <FormControl fullWidth>
            <CustomTextField
              fullWidth
              label='Email'
              value={userData.email}
              onChange={e => setUserData(p => ({ ...p, email: e.target.value }))}
              placeholder='Enter email'
            />
          </FormControl>
        </Box>

        <Box sx={{ my: 4 }}>
          <FormControl fullWidth>
            <CustomTextField
              fullWidth
              label='Phone Number'
              value={userData.phoneNumber}
              onChange={e => setUserData(p => ({ ...p, phoneNumber: e.target.value }))}
              placeholder='Enter phone number'
            />
          </FormControl>
        </Box>

        <FormControl sx={{ m: 1, width: '100%' }}>
          <InputLabel id='demo-multiple-chip-label'>Role</InputLabel>
          <Select
            labelId='demo-multiple-chip-label'
            id='demo-multiple-chip'
            multiple
            value={selectedRoles}
            onChange={e => handleRoleChange(e.target.value)}
            input={<OutlinedInput id='select-multiple-chip' label='Chip' />}
            renderValue={selected => (
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}

                // SelectProps={{ value: role, onChange: e => handledropdown(e.target.value) }}
              >
                {selectedRoles?.map(
                  value =>
                    value.enabled && (
                      <Chip
                        key={value.roleId}
                        label={value.roleName}
                        onMouseDown={event => {
                          event.stopPropagation()
                        }}
                        onDelete={event => handleRoleRemove(value.roleId)}
                      />
                    )
                )}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  width: 250
                }
              }
            }}
          >
            {rolesList?.data?.data?.map(item => (
              <MenuItem
                key={item.id}
                value={{
                  roleId: item.id,
                  roleName: item.name,
                  description: item.description,
                  enabled: true
                }}

                // disabled={rolesList?.data?.data?.some(role => role.roleId === item.id && role.enabled === true)}
              >
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid item sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Switch
              checked={userData.isActive || false}
              onChange={() => setUserData(p => ({ ...p, isActive: !p.isActive }))}
              inputProps={{ 'aria-label': 'role-controlled' }}
              sx={{
                '--Switch-thumbSize': '27px',
                '--Switch-trackWidth': '100px',
                '--Switch-trackHeight': '45px'
              }}
            />
            <Typography sx={{ ml: 2 }}>Active</Typography>
          </Box>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={Boolean(errorMsg)}>
            {mutation.isPending ? 'Loading...' : 'Submit'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={toggle}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddRoleDrawer
