import {
  Box,
  Flex,
  Heading,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        maxW="100%"
        mx="auto"
        px={4}
        py={4}
        align="center"
        justify="space-between"
      >
        {/* Logo and Navigation */}
        <HStack spacing={8}>
          <Heading
            as="h1"
            size="lg"
            bgGradient="linear(to-r, blue.400, blue.600)"
            bgClip="text"
            cursor="pointer"
            onClick={() => navigate("/dashboard")}
          >
            Ward Management
          </Heading>

          <HStack spacing={4} display={{ base: "none", md: "flex" }}>
            <Button
              variant={isActive("/dashboard") ? "solid" : "ghost"}
              colorScheme={isActive("/dashboard") ? "blue" : "gray"}
              onClick={() => navigate("/dashboard")}
              size="sm"
            >
              Dashboard
            </Button>
            <Button
              variant={isActive("/residents") ? "solid" : "ghost"}
              colorScheme={isActive("/residents") ? "blue" : "gray"}
              onClick={() => navigate("/residents")}
              size="sm"
            >
              Residents
            </Button>
          </HStack>
        </HStack>

        {/* User Menu */}
        {user && (
          <HStack spacing={4}>
            <Box display={{ base: "none", md: "block" }} textAlign="right">
              <Text fontSize="sm" fontWeight="medium">
                {user.name || user.email}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {user.role?.toUpperCase() || "USER"}
              </Text>
            </Box>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDownIcon />}
                leftIcon={<Avatar size="sm" name={user.name || user.email} />}
              >
                <Text display={{ base: "none", md: "block" }}>Account</Text>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => navigate("/residents")}>
                  Residents
                </MenuItem>
                <MenuItem onClick={handleLogout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
