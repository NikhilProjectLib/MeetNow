"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, sendMessage, subscribeToMessages } from "@/lib/chat-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ActivityChatProps {
  activityId: string;
  isJoined: boolean;
}

export function ActivityChat({ activityId, isJoined }: ActivityChatProps) {
  const currentUser = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to messages
  useEffect(() => {
    if (!activityId) return;

    const unsubscribe = subscribeToMessages(activityId, (msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  }, [activityId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    const text = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      await sendMessage(activityId, {
        senderId: currentUser?.id || "anonymous",
        senderName: currentUser?.name || "User",
        senderAvatar: currentUser?.avatar || "",
        text,
        type: "text",
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(text); // Restore on failure
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Collapsed view — just show button with unread count
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:bg-secondary transition-colors w-full"
      >
        <MessageCircle className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Group Chat</span>
        {messages.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {messages.length} messages
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-card">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-secondary/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Group Chat</span>
          <span className="text-xs text-muted-foreground">
            ({messages.length} messages)
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Minimize
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-80 overflow-y-auto px-4 py-3 flex flex-col gap-2 bg-background/50">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser?.id;
          const isSystem = msg.type === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn("flex gap-2 max-w-[80%]", isOwn ? "ml-auto flex-row-reverse" : "")}
            >
              {/* Avatar */}
              {!isOwn && (
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0 mt-auto">
                  {msg.senderName[0]}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
              >
                {!isOwn && (
                  <p className="text-[10px] font-medium opacity-70 mb-0.5">
                    {msg.senderName}
                  </p>
                )}
                <p className="break-words">{msg.text}</p>
                <p
                  className={cn(
                    "text-[10px] mt-0.5",
                    isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isJoined ? (
        <div className="flex items-center gap-2 px-3 py-3 border-t">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Join this activity to send messages
          </p>
        </div>
      )}
    </div>
  );
}
