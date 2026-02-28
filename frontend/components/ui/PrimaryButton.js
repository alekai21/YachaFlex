import { Button } from "@chakra-ui/react";

export default function PrimaryButton({ children, isLoading, loadingText, isDisabled, onClick, type = "button", w, size, px }) {
  return (
    <Button
      type={type}
      onClick={onClick}
      isLoading={isLoading}
      loadingText={loadingText}
      isDisabled={isDisabled}
      w={w}
      size={size}
      px={px}
      bg="#ff6600"
      color="white"
      _hover={{ bg: "#ff8800", boxShadow: "0 0 24px rgba(255,102,0,0.5)" }}
      _disabled={{ bg: "ui.disabledBg", color: "ui.disabledText", cursor: "not-allowed", boxShadow: "none" }}
      letterSpacing="0.1em"
      fontWeight="700"
      fontSize="sm"
      boxShadow="0 0 16px rgba(255,102,0,0.3)"
      borderRadius="6px"
    >
      {children}
    </Button>
  );
}
