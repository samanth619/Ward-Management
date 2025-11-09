import { Box, Container, Flex, Text, HStack, Link, Divider, useColorModeValue } from "@chakra-ui/react";

const Footer = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      mt="auto"
    >
      <Container maxW="container.xl" py={6}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color={textColor}>
            © {currentYear} Ward Management System. All rights reserved.
          </Text>
          
          <HStack spacing={4} fontSize="sm" color={textColor}>
            <Link href="#" _hover={{ color: "blue.500" }}>
              Privacy Policy
            </Link>
            <Divider orientation="vertical" h={4} />
            <Link href="#" _hover={{ color: "blue.500" }}>
              Terms of Service
            </Link>
            <Divider orientation="vertical" h={4} />
            <Link href="#" _hover={{ color: "blue.500" }}>
              Support
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;

