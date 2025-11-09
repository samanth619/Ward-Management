import { Box, Heading, Text, Button, VStack, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container maxW="container.md" centerContent>
      <Box
        textAlign="center"
        py={20}
        px={6}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
      >
        <VStack spacing={6}>
          <Heading
            display="inline-block"
            as="h2"
            size="4xl"
            bgGradient="linear(to-r, blue.400, blue.600)"
            backgroundClip="text"
          >
            404
          </Heading>
          <Text fontSize="18px" mt={3} mb={2}>
            Page Not Found
          </Text>
          <Text color={"gray.500"} mb={6}>
            The page you're looking for does not seem to exist
          </Text>

          <VStack spacing={3}>
            <Button
              colorScheme="blue"
              bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
              color="white"
              variant="solid"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
            >
              Go to {isAuthenticated ? "Dashboard" : "Home"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Container>
  );
};

export default NotFound;

