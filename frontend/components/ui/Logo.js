import { Box } from "@chakra-ui/react";
import Image from "next/image";

const sizes = {
  sm: { width: 150, height: 52 },
  lg: { width: 200, height: 70 },
};

export default function Logo({ size = "sm" }) {
  const { width, height } = sizes[size] ?? sizes.sm;
  return (
    <Box sx={{ filter: "drop-shadow(0 0 12px rgba(255,102,0,0.35))" }}>
      <Image
        src="/img/yachaFlex.png"
        alt="YachaFlex"
        width={width}
        height={height}
        style={{ objectFit: "contain" }}
        priority={size === "lg"}
      />
    </Box>
  );
}
