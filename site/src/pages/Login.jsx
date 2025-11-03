import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Heading,
  Text,
  useToast,
  Flex,
  Icon,
  Container,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, EmailIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import { FiShield } from 'react-icons/fi'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(email, password)

    setIsLoading(false)

    if (result.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Please check your credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-br, brand.50, brand.100, blue.50)"
      position="relative"
      overflow="hidden"
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        w="800px"
        h="800px"
        borderRadius="full"
        bg="brand.200"
        opacity="0.1"
        filter="blur(80px)"
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-10%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="blue.200"
        opacity="0.1"
        filter="blur(80px)"
      />

      <Container maxW="md" position="relative" zIndex={1}>
        <Card
          boxShadow="2xl"
          borderRadius="2xl"
          overflow="hidden"
          bg="white"
          backdropFilter="blur(10px)"
        >
          <Box
            bgGradient="linear(to-r, brand.500, brand.600)"
            p={8}
            textAlign="center"
            color="white"
          >
            <Flex justify="center" mb={4}>
              <Icon as={FiShield} w={12} h={12} />
            </Flex>
            <Heading size="xl" mb={2}>
              Ward Management System
            </Heading>
            <Text opacity={0.9}>Sign in to your account</Text>
          </Box>

          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Email Address
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'brand.400' }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                      }}
                    />
                    <InputRightElement h="full">
                      <EmailIcon color="gray.400" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'brand.400' }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                      }}
                    />
                    <InputRightElement h="full">
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm"
                        _hover={{ bg: 'transparent' }}
                      >
                        {showPassword ? (
                          <ViewOffIcon color="gray.400" />
                        ) : (
                          <ViewIcon color="gray.400" />
                        )}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  borderRadius="lg"
                  fontWeight="semibold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                >
                  Sign In
                </Button>

                <Flex
                  width="full"
                  align="center"
                  justify="space-between"
                  fontSize="sm"
                >
                  <Link to="/forgot-password" color="brand.500">
                    <Text color="brand.500" _hover={{ color: 'brand.600', textDecoration: 'underline' }}>
                      Forgot password?
                    </Text>
                  </Link>
                </Flex>

                <Divider />

                <Flex width="full" align="center" justify="center" gap={2}>
                  <Text color="gray.600">Don't have an account?</Text>
                  <Link to="/register">
                    <Text
                      color="brand.500"
                      fontWeight="semibold"
                      _hover={{ color: 'brand.600', textDecoration: 'underline' }}
                    >
                      Sign Up
                    </Text>
                  </Link>
                </Flex>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Text
          textAlign="center"
          mt={8}
          color="gray.600"
          fontSize="sm"
          position="relative"
          zIndex={1}
        >
          © 2024 Ward Management System. All rights reserved.
        </Text>
      </Container>
    </Flex>
  )
}

export default Login

