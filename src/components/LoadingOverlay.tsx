import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Creating course template...",
}) => {
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const containerStyle: React.CSSProperties = {
    textAlign: "center",
    color: "white",
  };

  const messageStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 500,
    marginTop: "20px",
    color: "white",
  };

  // Orbiting circles animation
  const orbitContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "120px",
    height: "120px",
  };

  const centerCircleStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "20px",
    height: "20px",
    backgroundColor: "#60a5fa",
    borderRadius: "50%",
  };

  const orbitStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    transform: "translate(-50%, -50%)",
    animation: "orbit 2s linear infinite",
  };

  const orbit2Style: React.CSSProperties = {
    ...orbitStyle,
    animation: "orbit 2s linear infinite reverse",
  };

  const orbit3Style: React.CSSProperties = {
    ...orbitStyle,
    animation: "orbit 3s linear infinite",
    width: "80%",
    height: "80%",
  };

  const circleStyle: React.CSSProperties = {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "16px",
    height: "16px",
    backgroundColor: "#3b82f6",
    borderRadius: "50%",
  };

  const circle2Style: React.CSSProperties = {
    ...circleStyle,
    backgroundColor: "#8b5cf6",
  };

  const circle3Style: React.CSSProperties = {
    ...circleStyle,
    backgroundColor: "#10b981",
  };

  // Keyframes need to be added to a style tag
  const keyframesStyle = `
    @keyframes orbit {
      from {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  `;

  return (
    <div style={overlayStyle}>
      <style>{keyframesStyle}</style>
      <div style={containerStyle}>
        <div style={orbitContainerStyle}>
          <div style={centerCircleStyle}></div>
          <div style={orbitStyle}>
            <div style={circleStyle}></div>
          </div>
          <div style={orbit2Style}>
            <div style={circle2Style}></div>
          </div>
          <div style={orbit3Style}>
            <div style={circle3Style}></div>
          </div>
        </div>
        <div style={messageStyle}>{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
