import { Button, useColorMode } from "@chakra-ui/react";

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: "6px", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: "6px", flexShrink: 0 }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Button
      position="fixed"
      top={4}
      right={4}
      zIndex={9999}
      size="sm"
      variant="ghost"
      onClick={toggleColorMode}
      color="ui.textSub"
      border="1px solid"
      borderColor="ui.borderMid"
      bg="ui.card"
      _hover={{ bg: "ui.elevated", borderColor: "ui.textSub", color: "ui.text" }}
      letterSpacing="0.08em"
      fontSize="xs"
      fontWeight="700"
      px={3}
      display="flex"
      alignItems="center"
      gap={0}
    >
      {isDark ? (
        <>
          <SunIcon />
          CLARO
        </>
      ) : (
        <>
          <MoonIcon />
          OSCURO
        </>
      )}
    </Button>
  );
}
