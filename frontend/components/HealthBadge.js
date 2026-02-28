import { Box, Tooltip, keyframes } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { checkHealth } from "../lib/api";


export default function HealthBadge() {
    const [status, setStatus] = useState("checking");
    const [dbStatus, setDbStatus] = useState("checking");

    useEffect(() => {
        let mounted = true;

        const verifyHealth = async () => {
            try {
                const res = await checkHealth();
                if (mounted) {
                    if (res.data) {
                        setStatus(res.data.status);
                        setDbStatus(res.data.db);
                    }
                    else {
                        setStatus("error");
                        setDbStatus(res.data?.db || "unknown");
                    }
                }
            } catch (err) {
                if (mounted) {
                    setStatus("error");
                    setDbStatus("unknown");
                }
            }
        };

        verifyHealth();

        // Check health every 60 seconds
        const interval = setInterval(verifyHealth, 60000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const color = status === "healthy" ? "green.400" : status === "checking" ? "yellow.400" : "red.400";
    const label = status === "healthy"
        ? "Systems Online"
        : status === "checking"
            ? "Checking status..."
            : dbStatus === "disconnected"
                ? "DB Offline"
                : "Backend Offline";

    return (
        <Tooltip label={label} placement="left" hasArrow bg="ui.card" color="ui.text">
            <Box
                position="fixed"
                bottom="4"
                right="4"
                w="12px"
                h="12px"
                bg={color}
                borderRadius="full"
                zIndex={1000}
                cursor="help"
                _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "full",
                    // animation: `${pulseRing} 2.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
                    bg: color,
                }}
            />
        </Tooltip>
    );
}
