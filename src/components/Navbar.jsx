import { Box, Button, Flex, Heading, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, VStack, Text, Avatar } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useState } from 'react';

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <>
      <Box as="header" borderBottomWidth="1px" bg="white" position="sticky" top={0} zIndex={10}>
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
            _hover={{ textDecoration: 'none', color: 'purple.600' }}
            flexShrink={0}
          >
            UBC Rate My Dish
          </Heading>
          <HStack ml={{ base: 0, md: 'auto' }} spacing={3} flexWrap="wrap">
            <Button as={RouterLink} to="/" variant="ghost">
              Home
            </Button>
            <Button as={RouterLink} to="/leaderboard" variant="ghost">
              Leaderboard
            </Button>
            <Button as={RouterLink} to="/halls" variant="ghost">
              Halls
            </Button>
            {user && (
              <Text fontWeight="medium" color="purple.600">
                Welcome back, {user.name.split(' ')[0]}!
              </Text>
            )}
            <Button
              onClick={user ? handleLogout : onOpen}
              colorScheme={user ? "red" : "purple"}
              variant="outline"
            >
              {user ? "Logout" : "Login"}
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{user ? 'Profile' : 'Login'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {!user ? (
              <VStack spacing={4} align="center">
                <Text color="gray.600" textAlign="center">
                  Please sign in with your Google account
                </Text>
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  useOneTap
                />
              </VStack>
            ) : (
              <VStack spacing={4} align="center">
                <Avatar src={user.picture} name={user.name} size="xl" />
                <Heading size="md">Hello, {user.name}!</Heading>
                <Text color="gray.600">{user.email}</Text>
                <Button colorScheme="purple" onClick={handleLogout} width="full">
                  Log Out
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
