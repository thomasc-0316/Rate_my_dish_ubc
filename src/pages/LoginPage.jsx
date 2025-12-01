import { useEffect, useState } from 'react';
import { Container, Heading, Text, VStack, Avatar, Button, Alert, AlertIcon, Spinner, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { signInWithPassword, signOut, signUpWithEmail, getProfile, updateUsername } from '../api';
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
  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');

  const isSignUp = mode === 'signup';
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    let authError;
    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password);
      authError = error;
    } else {
      const { error } = await signInWithPassword(email, password);
      authError = error;
    }

    if (authError) {
      setError(authError.message);
    } else {
      if (isSignUp) {
        setMessage('Check your email to confirm your account before signing in.');
      } else {
        setMessage('Signed in!');
      }
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

  // Load current username when logged in
  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setUsername('');
        return;
      }
      setUsernameLoading(true);
      setUsernameError('');
      setUsernameMessage('');
      try {
        const profile = await getProfile(user.id);
        setUsername(profile?.username || '');
      } catch (e) {
        // Non-fatal: user can still set a username
        setUsername('');
      } finally {
        setUsernameLoading(false);
      }
    })();
  }, [user?.id]);

  const onSaveUsername = async () => {
    setSavingUsername(true);
    setUsernameError('');
    setUsernameMessage('');
    const { error } = await updateUsername(username);
    if (error) {
      setUsernameError(error.message || 'Could not update username.');
    } else {
      setUsernameMessage('Username updated!');
    }
    setSavingUsername(false);
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
          <Heading size="lg" color="brand.600">
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
          {/* Username input removed: usernames are no longer set/changed by users */}
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
          <VStack w="full" spacing={3} align="stretch">
            <Heading size="sm">Your username</Heading>
            {usernameError ? (
              <Alert status="error" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {usernameError}
              </Alert>
            ) : null}
            {usernameMessage ? (
              <Alert status="success" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {usernameMessage}
              </Alert>
            ) : null}
            <FormControl isRequired isDisabled={usernameLoading}>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. thunderbird123"
              />
            </FormControl>
            <Button
              colorScheme="brand"
              onClick={onSaveUsername}
              isLoading={savingUsername}
              isDisabled={usernameLoading || !username || username.trim().length < 3}
            >
              Save Username
            </Button>
            <Text color="gray.500" fontSize="sm">
              3–20 characters. Letters, numbers, underscore, and dot only. Must be unique.
            </Text>
          </VStack>
          <Button colorScheme="brand" onClick={handleLogout}>
            Log Out
          </Button>
        </VStack>
      )}
    </Container>
  );
}
