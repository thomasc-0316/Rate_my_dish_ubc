import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useState } from 'react';
import { Box, Container, Heading, Text, VStack, Avatar, Button } from '@chakra-ui/react';

export default function LoginPage() {
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
    <Container maxW="md" py={20}>
      {!user ? (
        <VStack
          spacing={6}
          p={8}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
        >
          <Heading size="lg" color="purple.600">
            Welcome to UBC Rate My Dish
          </Heading>
          <Text color="gray.600" textAlign="center">
            Please sign in with your Google account to continue
          </Text>
          <Box mt={4}>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              useOneTap
            />
          </Box>
        </VStack>
      ) : (
        <VStack
          spacing={6}
          p={8}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
        >
          <Avatar src={user.picture} name={user.name} size="xl" />
          <Heading size="md">Hello, {user.name}!</Heading>
          <Text color="gray.600">{user.email}</Text>
          <Button colorScheme="purple" onClick={handleLogout}>
            Log Out
          </Button>
        </VStack>
      )}
    </Container>
  );
}
