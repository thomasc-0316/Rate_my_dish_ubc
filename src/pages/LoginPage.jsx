import { useState } from 'react';
import { Container, Heading, Text, VStack, Avatar, Button, Input, FormControl, FormLabel, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import { signInWithPassword, signOut, signUpWithEmail, ensureProfile, getProfile, updateUsername } from '../api';
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
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState('');
  const [usernameErr, setUsernameErr] = useState('');

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
        // Ensure a profile exists on successful sign-in
        try {
          await ensureProfile();
        } catch (e) {
          // Non-fatal: profile creation can be retried later
          console.warn('ensureProfile failed', e);
        }
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

  // Load current user's profile when signed in
  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setProfileUsername('');
        setUsernameInput('');
        setUsernameMsg('');
        setUsernameErr('');
        return;
      }
      try {
        setUsernameLoading(true);
        const profile = await getProfile(user.id);
        const uname = profile?.username || '';
        setProfileUsername(uname);
        setUsernameInput(uname);
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setUsernameLoading(false);
      }
    })();
  }, [user?.id]);

  const handleSaveUsername = async () => {
    if (!user) return;
    setUsernameSaving(true);
    setUsernameErr('');
    setUsernameMsg('');
    try {
      const { username: saved } = await updateUsername(usernameInput);
      setProfileUsername(saved);
      setUsernameInput(saved);
      setUsernameMsg('Username updated successfully.');
    } catch (e) {
      const msg = e?.message || 'Failed to update username.';
      setUsernameErr(msg);
    } finally {
      setUsernameSaving(false);
    }
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
          <VStack spacing={3} w="full" align="stretch">
            <Heading size="sm">Your username</Heading>
            {usernameErr ? (
              <Alert status="error" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {usernameErr}
              </Alert>
            ) : null}
            {usernameMsg ? (
              <Alert status="success" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {usernameMsg}
              </Alert>
            ) : null}
            <FormControl isRequired isDisabled={usernameLoading}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="your_username"
              />
            </FormControl>
            <Button
              colorScheme="brand"
              onClick={handleSaveUsername}
              isLoading={usernameSaving}
              isDisabled={usernameLoading || !usernameInput?.trim()}
              w="full"
            >
              Save username
            </Button>
            {profileUsername ? (
              <Text fontSize="sm" color="gray.600">Current: @{profileUsername}</Text>
            ) : null}
          </VStack>
          <Button colorScheme="brand" onClick={handleLogout}>
            Log Out
          </Button>
        </VStack>
      )}
    </Container>
  );
}
