import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Select,
  Divider,
  FormErrorMessage,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, EmailIcon, PhoneIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import { FiShield, FiUser, FiKey } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    role: "staff",
    ward_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Ward number validation - only required if role is staff and ward_number is provided
    // Note: API allows ward_number to be optional even for staff
    if (formData.role === "staff" && formData.ward_number) {
      if (!/^[a-zA-Z0-9]+$/.test(formData.ward_number)) {
        newErrors.ward_number =
          "Ward number can only contain letters and numbers";
      }
      if (formData.ward_number.length > 10) {
        newErrors.ward_number = "Ward number must be 10 characters or less";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    // Prepare data to send - only include ward_number if role is 'staff'
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      phone: formData.phone || undefined,
      role: formData.role,
    };

    // Only include ward_number if role is staff
    if (formData.role === "staff" && formData.ward_number) {
      submitData.ward_number = formData.ward_number;
    }

    // Remove undefined values
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === undefined || submitData[key] === "") {
        delete submitData[key];
      }
    });

    const result = await register(submitData);

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Registration Successful",
        description: result.data.email_verification_required
          ? "Please check your email to verify your account."
          : "Your account has been created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/dashboard");
    } else {
      // Handle field-specific validation errors from API
      if (result.errors && Array.isArray(result.errors)) {
        const errorMap = {};
        result.errors.forEach((err) => {
          // Handle both field names from API (could be 'email' or 'confirm_password' etc)
          const fieldName = err.field || err.path || err.param;
          errorMap[fieldName] = err.message || err.msg;
        });
        setErrors(errorMap);
      }

      toast({
        title: "Registration Failed",
        description:
          result.error ||
          result.message ||
          "Please check the form and try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-br, brand.50, brand.100, blue.50)"
      py={8}
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

      <Container maxW="lg" position="relative" zIndex={1}>
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
              Create Your Account
            </Heading>
            <Text opacity={0.9}>Join the Ward Management System</Text>
          </Box>

          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    <Icon as={FiUser} mr={2} />
                    Full Name
                  </FormLabel>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                    }}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.email}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    <Icon as={EmailIcon} mr={2} />
                    Email Address
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "brand.400" }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                    <InputRightElement h="full">
                      <EmailIcon color="gray.400" />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phone}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    <Icon as={PhoneIcon} mr={2} />
                    Phone Number
                  </FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: "brand.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                    }}
                  />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>

                <Flex width="full" gap={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" color="gray.700">
                      Role
                    </FormLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "brand.400" }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    >
                      <option value="staff">Staff</option>
                      <option value="read_only">Read Only</option>
                    </Select>
                  </FormControl>

                  <FormControl
                    isRequired={formData.role === "staff"}
                    isInvalid={!!errors.ward_number}
                  >
                    <FormLabel fontWeight="semibold" color="gray.700">
                      Ward Number
                    </FormLabel>
                    <Input
                      type="text"
                      name="ward_number"
                      placeholder="WARD001"
                      value={formData.ward_number}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "brand.400" }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                    <FormErrorMessage>{errors.ward_number}</FormErrorMessage>
                  </FormControl>
                </Flex>

                <FormControl isRequired isInvalid={!!errors.password}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    <Icon as={FiKey} mr={2} />
                    Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "brand.400" }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                    <InputRightElement h="full">
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm"
                        _hover={{ bg: "transparent" }}
                      >
                        {showPassword ? (
                          <ViewOffIcon color="gray.400" />
                        ) : (
                          <ViewIcon color="gray.400" />
                        )}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Must contain uppercase, lowercase, number, and special
                    character
                  </Text>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.confirm_password}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Confirm Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      placeholder="Confirm your password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "brand.400" }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                    <InputRightElement h="full">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        size="sm"
                        _hover={{ bg: "transparent" }}
                      >
                        {showConfirmPassword ? (
                          <ViewOffIcon color="gray.400" />
                        ) : (
                          <ViewIcon color="gray.400" />
                        )}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirm_password}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  borderRadius="lg"
                  fontWeight="semibold"
                  mt={2}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Create Account
                </Button>

                <Divider />

                <Flex width="full" align="center" justify="center" gap={2}>
                  <Text color="gray.600">Already have an account?</Text>
                  <Link to="/login">
                    <Text
                      color="brand.500"
                      fontWeight="semibold"
                      _hover={{
                        color: "brand.600",
                        textDecoration: "underline",
                      }}
                    >
                      Sign In
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
  );
};

export default Register;
