import type { ChatMessage } from "@/lib/types";

type MessageBubbleProps = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-lg md:max-w-[75%]",
          isUser
            ? "bg-[linear-gradient(135deg,#ec4899,#a855f7)] text-white shadow-[0_18px_40px_rgba(147,51,234,0.28)]"
            : "border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.07))] text-fuchsia-50 backdrop-blur",
        ].join(" ")}
      >
        {message.content}
      </div>
    </div>
  );
}
