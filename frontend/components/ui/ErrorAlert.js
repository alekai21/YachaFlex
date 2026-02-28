import { Alert, AlertDescription, AlertIcon } from "@chakra-ui/react";

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <Alert status="error" bg="ui.errorBg" border="1px solid #ff2244" borderRadius="md">
      <AlertIcon color="#ff2244" />
      <AlertDescription color="#ff6680" fontSize="sm">{message}</AlertDescription>
    </Alert>
  );
}
