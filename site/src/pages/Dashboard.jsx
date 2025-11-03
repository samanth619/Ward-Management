import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <Box p={8}>
      <Heading mb={4}>Dashboard</Heading>
      <Text mb={4}>Welcome, {user?.name}!</Text>
      <Button onClick={logout}>Logout</Button>
    </Box>
  )
}

export default Dashboard

