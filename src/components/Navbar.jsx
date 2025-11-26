import { Box, Button, Flex, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, VStack, Text, Avatar, Divider, IconButton, Input, FormControl, FormLabel, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { signInWithPassword, signOut, signUpWithEmail } from '../api';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function Navbar() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const isSignUp = mode === 'signup';
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const action = isSignUp ? signUpWithEmail : signInWithPassword;
    const { error: authError } = await action(email, password);

    if (authError) {
      setError(authError.message);
    } else {
      setMessage(isSignUp ? 'Check your email to confirm your account before signing in.' : 'Signed in!');
      setEmail('');
      setPassword('');
    }

    setSubmitting(false);
  };

  const handleLogout = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
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
              icon={
                user ? (
                  <Avatar
                    size="sm"
                    name={displayName}
                    src={user?.user_metadata?.avatar_url ?? undefined}
                  />
                ) : undefined
              }
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
              {authLoading ? (
                <VStack spacing={3} px={4} py={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.600">Checking session...</Text>
                </VStack>
              ) : !user ? (
                <VStack as="form" spacing={4} px={4} py={2} onSubmit={handleSubmit}>
                  <Text color="gray.600" textAlign="center" fontSize="sm">
                    {isSignUp ? 'Create an account to start rating dishes.' : 'Sign in with your email and password.'}
                  </Text>
                  {error ? (
                    <Alert status="error" borderRadius="md" fontSize="sm">
                      <AlertIcon />
                      {error}
                    </Alert>
                  ) : null}
                  {message ? (
                    <Alert status="success" borderRadius="md" fontSize="sm">
                      <AlertIcon />
                      {message}
                    </Alert>
                  ) : null}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="purple"
                    w="full"
                    isLoading={submitting}
                  >
                    {isSignUp ? 'Create account' : 'Sign in'}
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
                  >
                    {isSignUp ? 'Have an account? Sign in' : 'Need an account? Sign up'}
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  <VStack spacing={2} px={4} pb={2}>
                    <Avatar
                      name={displayName}
                      size="lg"
                      src={user?.user_metadata?.avatar_url ?? undefined}
                    />
                    <Text fontWeight="semibold" fontSize="md">{displayName}</Text>
                    <Text color="gray.600" fontSize="sm">{user.email}</Text>
                  </VStack>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    color="red.600"
                    fontWeight="medium"
                    _hover={{ bg: 'red.50' }}
                    isDisabled={signingOut}
                  >
                    {signingOut ? 'Logging out...' : 'Logout'}
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
