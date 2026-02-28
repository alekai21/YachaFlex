import { Box, Heading, HStack } from "@chakra-ui/react";

const accentStyles = {
  orange: {
    bg: "#ff6600",
    boxShadow: "0 0 10px rgba(255,102,0,0.7)",
  },
  gray: {
    bg: "#8a8a8a",
    boxShadow: "none",
  },
};

export default function SectionHeading({ title, accentColor = "orange" }) {
  const accent = accentStyles[accentColor] ?? accentStyles.orange;
  return (
    <HStack mb={2}>
      <Box w="3px" h="22px" borderRadius="full" bg={accent.bg} sx={{ boxShadow: accent.boxShadow }} />
      <Heading size="md" color="ui.text" letterSpacing="0.1em" fontWeight="700">
        {title}
      </Heading>
    </HStack>
  );
}
