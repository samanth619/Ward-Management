import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Box as="main" flex="1" w="100%">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout;

