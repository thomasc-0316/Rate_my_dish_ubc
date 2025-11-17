import { Box, Text } from '@chakra-ui/react';

export default function CommentItem({ username, timestamp, text }) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <Text fontWeight="bold">@{username}</Text>
      {timestamp && (
        <Text fontSize="sm" color="gray.500">
          {timestamp}
        </Text>
      )}
      <Text mt={1}>{text}</Text>
    </Box>
  );
}
