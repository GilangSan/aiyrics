import { useState } from "react";
import { Copy, Check } from "lucide-react";

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000); // Reset "copied" state after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      {copied ? (
        <Check size={15} />
      ) : (
        <Copy size={15} onClick={handleCopy} className="cursor-pointer hover:text-neutral-400" />
      )}
    </>
  );
};

export default CopyButton;
