# RAPID Sim

Local-network educational simulator for introductory ABB RAPID programming and an IRB 1090-inspired 3D robot.

## Start locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the displayed URL, or use the computer's LAN IP from another device.

## Deploy on a local network

```bash
docker compose up --build -d
```

Open `http://<teacher-computer-LAN-IP>:8080`. Allow incoming traffic on port `8080` through the host firewall if required.

## Simulator boundary

This application implements a limited teaching subset of RAPID. It does not connect to OmniCore hardware and is not a safety, motion-planning, or production-code validation system. Validate every program and all safety requirements before using an actual robot.

## Teaching workspace

The visual model calculates a 220-580 mm tool-tip envelope from its shoulder axis. Use the displayed 280-550 mm comfortable workspace for new lesson targets; the built-in target library stays inside that range. These dimensions are educational visual-model values, not ABB controller limits.
