// CHANGED: Updated to use routing for ticket system pages
import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Button } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { MintTicket } from "./MintTicket";
import { MyTickets } from "./MyTickets";
import { Scanner } from "./Scanner";

function Navigation() {
  const location = useLocation();

  return (
    <Flex gap="2">
      <Link to="/">
        <Button variant={location.pathname === "/" ? "solid" : "soft"} size="2">
          Mint
        </Button>
      </Link>
      <Link to="/my-tickets">
        <Button
          variant={location.pathname === "/my-tickets" ? "solid" : "soft"}
          size="2"
        >
          My Tickets
        </Button>
      </Link>
      <Link to="/scanner">
        <Button
          variant={location.pathname === "/scanner" ? "solid" : "soft"}
          size="2"
        >
          Scanner
        </Button>
      </Link>
    </Flex>
  );
}

function AppContent() {
  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>CalHacks 12.0 Tickets</Heading>
        </Box>

        <Navigation />

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          <Routes>
            <Route path="/" element={<MintTicket />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/scanner" element={<Scanner />} />
          </Routes>
        </Container>
      </Container>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
