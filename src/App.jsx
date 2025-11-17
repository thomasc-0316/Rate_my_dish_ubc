import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Halls from './pages/Halls';
import DiningHallPage from './pages/DiningHallPage';
import DishPage from './pages/DishPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Navbar from './components/Navbar';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'gray.50',
        color: 'gray.900'
      },
      '#root': {
        minHeight: '100vh',
        backgroundColor: 'gray.50'
      }
    }
  }
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Navbar />
        <Box as="main" bg="transparent">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/halls" element={<Halls />} />
            <Route path="/hall/:hallId" element={<DiningHallPage />} />
            <Route path="/hall/:hallId/station/:stationId/dish/:dishId" element={<DishPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  );
}
