import { useState } from 'react';
import { Container, Heading, Text, VStack, Avatar, Button, Input, FormControl, FormLabel, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import { signInWithPassword, signOut, signUpWithEmail } from '../api';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function LoginPage() {
  const { user, loading } = useSupabaseAuth();
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

  if (loading) {
    return (
      <Container maxW="md" py={20}>
        <VStack spacing={4}>
          <Spinner />
          <Text color="gray.600">Checking your session...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={20}>
      {!user ? (
        <VStack
          as="form"
          spacing={6}
          p={8}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
          onSubmit={handleSubmit}
        >
          <Heading size="lg" color="purple.600">
            Welcome to UBC Rate My Dish
          </Heading>
          <Text color="gray.600" textAlign="center">
            {isSignUp
              ? 'Create an account with your email and password.'
              : 'Sign in with your Supabase email and password.'}
          </Text>
          {error ? (
            <Alert status="error" borderRadius="md" fontSize="sm" w="full">
              <AlertIcon />
              {error}
            </Alert>
          ) : null}
          {message ? (
            <Alert status="success" borderRadius="md" fontSize="sm" w="full">
              <AlertIcon />
              {message}
            </Alert>
          ) : null}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </FormControl>
          <Button type="submit" colorScheme="purple" w="full" isLoading={submitting}>
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
        <VStack
          spacing={6}
          p={8}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
        >
          <Avatar
            name={displayName}
            size="xl"
            src={user?.user_metadata?.avatar_url ?? undefined}
          />
          <Heading size="md">Hello, {displayName}!</Heading>
          <Text color="gray.600">{user.email}</Text>
          <Button colorScheme="purple" onClick={handleLogout} isLoading={signingOut}>
            Log Out
          </Button>
        </VStack>
      )}
    </Container>
  );
}
