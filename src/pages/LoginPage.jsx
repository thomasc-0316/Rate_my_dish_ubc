import { useEffect, useRef, useState } from 'react';
import { Container, Heading, Text, VStack, Avatar, Button, Alert, AlertIcon, Spinner, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { signInWithPassword, signOut, signUpWithEmail, getProfile, updateUsername } from '../api';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function LoginPage() {
  const { user, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('signin');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [needsUsername, setNeedsUsername] = useState(false);
  const [usernameBusy, setUsernameBusy] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState('');
  const [usernameErr, setUsernameErr] = useState('');
  const promptedRef = useRef(false);

  const isSignUp = mode === 'signup';
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    let authError;
    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password, username || undefined);
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
      setUsername('');
    }

    setSubmitting(false);
  };

  const handleLogout = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setProfileUsername('');
        setNeedsUsername(false);
        setUsernameMsg('');
        setUsernameErr('');
        promptedRef.current = false;
        return;
      }
      try {
        const profile = await getProfile(user.id);
        const uname = profile?.username || '';
        setProfileUsername(uname);
        const missing = !uname || !uname.trim();
        setNeedsUsername(missing);
        if (missing && !promptedRef.current) {
          promptedRef.current = true;
          // Prompt user to set a username immediately after sign-in
          await promptForUsername();
        }
      } catch (e) {
        console.warn('Failed to load profile', e);
        setNeedsUsername(true);
        if (!promptedRef.current) {
          promptedRef.current = true;
          await promptForUsername();
        }
      }
    })();
  }, [user?.id]);

  async function promptForUsername() {
    if (!user) return;
    setUsernameErr('');
    setUsernameMsg('');
    try {
      // Basic prompt UX to collect username
      let input = window.prompt('Choose a username (letters, numbers, underscore, 3–32 chars):', profileUsername || '');
      if (input == null) {
        // user cancelled
        setNeedsUsername(!profileUsername);
        return;
      }
      input = String(input).trim();
      if (!input) {
        setUsernameErr('Username cannot be empty.');
        setNeedsUsername(true);
        return;
      }
      setUsernameBusy(true);
      const { username: saved } = await updateUsername(input);
      setProfileUsername(saved);
      setNeedsUsername(false);
      setUsernameMsg('Username set successfully.');
    } catch (e) {
      const msg = e?.message || 'Failed to set username.';
      setUsernameErr(msg);
      setNeedsUsername(true);
    } finally {
      setUsernameBusy(false);
    }
  }

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
          {isSignUp ? (
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
              />
            </FormControl>
          ) : null}
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
          {usernameErr ? (
            <Alert status="error" borderRadius="md" fontSize="sm" w="full">
              <AlertIcon />
              {usernameErr}
            </Alert>
          ) : null}
          {usernameMsg ? (
            <Alert status="success" borderRadius="md" fontSize="sm" w="full">
              <AlertIcon />
              {usernameMsg}
            </Alert>
          ) : null}
          {needsUsername ? (
            <Alert status="warning" borderRadius="md" fontSize="sm" w="full">
              <AlertIcon />
              You need to set a username to continue. Click "Set Username" below.
            </Alert>
          ) : null}
          <Button colorScheme="brand" variant="solid" onClick={promptForUsername} isLoading={usernameBusy} w="full">
            {profileUsername ? 'Change Username' : 'Set Username'}
          </Button>
          {profileUsername ? (
            <Text fontSize="sm" color="gray.600">Current: @{profileUsername}</Text>
          ) : null}
          <Button colorScheme="brand" onClick={handleLogout}>
            Log Out
          </Button>
        </VStack>
      )}
    </Container>
  );
}
