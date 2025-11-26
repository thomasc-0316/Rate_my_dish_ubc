import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  Textarea,
  VStack,
  useToast
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../lib/supabase";

const key = import.meta.env.VITE_GEMINI_API_KEY;
const hasSupabaseCreds = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Assistant({ maxHeight = "360px" }) {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuContext, setMenuContext] = useState("");
  const [isMenuLoading, setIsMenuLoading] = useState(hasSupabaseCreds);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm DishHelper 3000. Tell me what you're craving and I'll recommend a dining hall dish."
    }
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!key) {
      toast({
        title: "Missing API key",
        description: "Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.",
        status: "error",
        isClosable: true
      });
    }
    if (!hasSupabaseCreds) {
      toast({
        title: "Missing Supabase credentials",
        description: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.",
        status: "warning",
        isClosable: true
      });
    }
  }, [toast, key]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!hasSupabaseCreds) return;

    const loadMenu = async () => {
      setIsMenuLoading(true);
      try {
        const [hallsRes, stationsRes, dishesRes] = await Promise.all([
          supabase.from("dining_halls").select("id,name,slug"),
          supabase.from("stations").select("id,hall_id,name,slug"),
          supabase.from("dishes").select("id,name,station_id")
        ]);

        if (hallsRes.error || stationsRes.error || dishesRes.error) {
          throw hallsRes.error || stationsRes.error || dishesRes.error;
        }

        const halls = hallsRes.data ?? [];
        const stations = stationsRes.data ?? [];
        const dishes = dishesRes.data ?? [];

        const hallById = new Map(halls.map((hall) => [hall.id, hall]));
        const stationById = new Map(stations.map((station) => [station.id, station]));

        const contextLines = dishes.slice(0, 150).map((dish) => {
          const station = stationById.get(dish.station_id);
          const hall = station ? hallById.get(station.hall_id) : null;
          const hallName = hall?.name || "Unknown hall";
          const stationName = station?.name || "Unknown station";
          return `${dish.name} - Hall: ${hallName} | Station: ${stationName}`;
        });

        setMenuContext(contextLines.join("\n"));
      } catch (error) {
        console.error("Failed to load menu context:", error);
        toast({
          title: "Menu data unavailable",
          description: "DishHelper 3000 will answer without live menu context.",
          status: "error",
          isClosable: true
        });
      } finally {
        setIsMenuLoading(false);
      }
    };

    loadMenu();
  }, [toast, hasSupabaseCreds]);

  const model = useMemo(() => {
    if (!key) return null;
    const ai = new GoogleGenerativeAI(key);
    return ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are DishHelper 3000, a concise dining hall guide. Suggest dishes using the provided menu snapshot when possible. Never mention the underlying model. Keep replies under 120 words."
    });
  }, [key]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !model) return;

    const userMessage = { role: "user", content: trimmed };
    const history = [...messages, userMessage];

    setMessages(history);
    setInput("");
    setIsSending(true);

    try {
      const contextIntro = menuContext
        ? [
            {
              role: "user",
              parts: [{ text: `Menu snapshot:\n${menuContext}` }]
            }
          ]
        : [];

      const result = await model.generateContent({
        contents: [
          ...contextIntro,
          ...history.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }))
        ]
      });

      const reply = result.response?.text() || "I had trouble responding just now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply.trim() }]);
    } catch (error) {
      console.error("DishHelper error:", error);
      toast({
        title: "Chat request failed",
        description: "Please try again.",
        status: "error",
        isClosable: true
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into an issue. Mind asking again?" }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box position="fixed" bottom={6} right={6} zIndex={20}>
      {!isOpen && (
        <Button
          borderRadius="full"
          w="64px"
          h="64px"
          colorScheme="blue"
          boxShadow="md"
          onClick={() => setIsOpen(true)}
        >
          DH
        </Button>
      )}

      {isOpen && (
        <Box
          maxW="480px"
          w="90vw"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          bg="white"
          p={4}
          boxShadow="xl"
        >
          <Flex justify="space-between" align="center" mb={3}>
            <Box>
              <Text fontWeight="bold">DishHelper 3000</Text>
              <Text fontSize="sm" color="gray.500">
                Quick dining hall recommendations
              </Text>
            </Box>
            <Flex align="center" gap={2}>
              <Badge colorScheme={isMenuLoading ? "yellow" : menuContext ? "green" : "orange"}>
                {isMenuLoading ? "Loading menu..." : menuContext ? "Menu linked" : "Menu offline"}
              </Badge>
              <IconButton
                aria-label="Close DishHelper"
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                icon={<CloseIcon />}
              />
            </Flex>
          </Flex>

          <Box
            ref={scrollRef}
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="lg"
            bg="gray.50"
            p={3}
            h={maxHeight}
            overflowY="auto"
          >
            <VStack spacing={3} align="stretch">
              {messages.map((message, index) => (
                <Flex
                  key={`${message.role}-${index}`}
                  justify={message.role === "user" ? "flex-end" : "flex-start"}
                >
                  <Box
                    maxW="80%"
                    bg={message.role === "user" ? "blue.500" : "white"}
                    color={message.role === "user" ? "white" : "gray.900"}
                    borderRadius="md"
                    px={3}
                    py={2}
                    boxShadow="xs"
                    borderWidth={message.role === "assistant" ? "1px" : "0"}
                    borderColor="gray.100"
                  >
                    <Text fontSize="xs" mb={1} opacity={0.8}>
                      {message.role === "user" ? "You" : "DishHelper 3000"}
                    </Text>
                    <Text whiteSpace="pre-wrap">{message.content}</Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box mt={3}>
            <Textarea
              placeholder="Ask for a recommendation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              bg="white"
              borderColor="gray.200"
              resize="vertical"
              minH="70px"
            />
            <Flex mt={2} gap={2} justify="flex-end">
              <Button
                colorScheme="blue"
                onClick={sendMessage}
                isLoading={isSending}
                loadingText="Sending"
                size="sm"
              >
                Send
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
}
