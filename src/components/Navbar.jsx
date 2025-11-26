import { Box, Button, Flex, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, VStack, Text, Avatar, Divider, IconButton } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (credentialResponse) => {
    // Decode JWT token to get user info
    const token = credentialResponse.credential;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const userInfo = JSON.parse(jsonPayload);
    setUser({
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    });
  };

  const handleLoginError = () => {
    console.error('Login Failed');
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="gray.200"
      bg="white"
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={3}
        align="center"
        wrap="wrap"
        gap={3}
      >
        <Heading
          size="md"
          as={RouterLink}
          to="/"
          _hover={{ textDecoration: 'none', color: 'brand.600' }}
          flexShrink={0}
        >
          UBC Rate My Dish
        </Heading>
        <HStack ml={{ base: 0, md: 'auto' }} spacing={3} flexWrap="wrap">
          <Button as={RouterLink} to="/leaderboard" variant="ghost" color="gray.700">
            Leaderboard
          </Button>

          {/* Login/Profile Menu */}
          <Menu placement="bottom-end">
            <MenuButton
              as={user ? IconButton : Button}
              colorScheme="brand"
              variant={user ? "ghost" : "outline"}
              icon={user ? <Avatar size="sm" src={user.picture} name={user.name} /> : undefined}
              _hover={{ transform: 'scale(1.05)', transition: 'all 0.2s' }}
            >
              {!user && "Login"}
            </MenuButton>
            <MenuList
              boxShadow="xl"
              borderWidth="1px"
              borderColor="gray.200"
              py={3}
              minW="280px"
            >
              {!user ? (
                <VStack spacing={4} px={4} py={2}>
                  <Text color="gray.600" textAlign="center" fontSize="sm">
                    Sign in with your Google account
                  </Text>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                  />
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  <VStack spacing={2} px={4} pb={2}>
                    <Avatar src={user.picture} name={user.name} size="lg" />
                    <Text fontWeight="semibold" fontSize="md">{user.name}</Text>
                    <Text color="gray.600" fontSize="sm">{user.email}</Text>
                  </VStack>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    color="red.600"
                    fontWeight="medium"
                    _hover={{ bg: 'red.50' }}
                  >
                    Logout
                  </MenuItem>
                </VStack>
              )}
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
}
