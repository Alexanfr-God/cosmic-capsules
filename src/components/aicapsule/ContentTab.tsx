
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Upload, CalendarIcon } from "lucide-react";

interface ContentTabProps {
  eventName: string;
  setEventName: (name: string) => void;
  message: string;
  setMessage: (message: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  previewUrl: string | null;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
}

const ContentTab = ({
  eventName,
  setEventName,
  message,
  setMessage,
  selectedDate,
  setSelectedDate,
  previewUrl,
  handleImageUpload,
  selectedImage,
  setSelectedImage,
  setPreviewUrl
}: ContentTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm text-neon-blue font-medium">EVENT NAME</label>
        <Input
          placeholder="Enter event name..."
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neon-blue font-medium">MESSAGE</label>
        <Textarea
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] bg-space-light/30 border-neon-blue/20 text-white placeholder:text-white/50 focus:border-neon-blue resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neon-blue font-medium">EVENT IMAGE</label>
        <div className="relative h-40 border-2 border-dashed border-neon-blue/20 rounded-lg overflow-hidden group hover:border-neon-blue/40 transition-colors">
          {previewUrl ? (
            <div className="relative h-full">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-red-500/80 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600/80 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-full cursor-pointer">
              <Upload className="w-8 h-8 text-neon-blue mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-neon-blue text-sm">Click to upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neon-blue font-medium">OPENING DATE</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full bg-space-light/30 border-neon-blue/20 text-white hover:bg-space-light/50 hover:border-neon-blue"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-neon-blue" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-space-dark border-neon-blue/20">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="bg-transparent"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ContentTab;
