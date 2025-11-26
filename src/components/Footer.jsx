import { Box, HStack, Link, Text } from '@chakra-ui/react';

const contributors = [
  { name: 'Ryan', url: 'https://www.linkedin.com/in/ryankim373/' },
  { name: 'Muk', url: 'https://www.linkedin.com/in/muk-chunpongtong-060b842a8/' },
  { name: 'Thomas', url: 'https://www.linkedin.com/in/thomas-chen-7b1b86228/' },
  { name: 'Daniel', url: 'https://www.linkedin.com/in/danelzhan/' },
  { name: 'Ivan', url: 'https://www.linkedin.com/in/ivan-yingfan-luo/' }
];

export default function Footer() {
  return (
    <Box
      as="footer"
      py={4}
      px={6}
      borderTopWidth="1px"
      borderColor="gray.200"
      bg="white"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={5}
    >
      <HStack spacing={2} justify="center" flexWrap="wrap">
        <Text fontSize="sm" color="gray.600">
          Made with ❤️ by
        </Text>
        {contributors.map((person, idx) => (
          <HStack key={person.name} spacing={1}>
            <Link href={person.url} isExternal fontWeight="semibold" color="brand.600">
              {person.name}
            </Link>
            {idx < contributors.length - 1 && (
              <Text fontSize="sm" color="gray.500">
                ·
              </Text>
            )}
          </HStack>
        ))}
      </HStack>
    </Box>
  );
}
