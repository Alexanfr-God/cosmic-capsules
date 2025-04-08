
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot } from "lucide-react";

// Import custom hooks and components
import { useCapsuleWidget } from "@/hooks/useCapsuleWidget";
import ContentTab from "./aicapsule/ContentTab";
import SecurityTab from "./aicapsule/SecurityTab";
import BiddingTab from "./aicapsule/BiddingTab";

const AICapsuleWidget = () => {
  const {
    isOpen,
    setIsOpen,
    eventName,
    setEventName,
    message,
    setMessage,
    selectedDate,
    setSelectedDate,
    selectedImage,
    setSelectedImage,
    previewUrl,
    setPreviewUrl,
    allowBidding,
    setAllowBidding,
    minimumBid,
    setMinimumBid,
    encryptionLevel,
    setEncryptionLevel,
    isLoading,
    handleImageUpload,
    handleCreateCapsule
  } = useCapsuleWidget();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-neon-blue to-neon-pink border border-white/20 backdrop-blur-lg shadow-lg hover:scale-110 transition-all duration-300 group z-50"
      >
        <Bot className="w-8 h-8 mx-auto text-white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-space-dark/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              CREATE NEW TIME CAPSULE
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="content">CONTENT</TabsTrigger>
              <TabsTrigger value="security">SECURITY</TabsTrigger>
              <TabsTrigger value="bidding">BIDDING</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <ContentTab
                eventName={eventName}
                setEventName={setEventName}
                message={message}
                setMessage={setMessage}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                previewUrl={previewUrl}
                handleImageUpload={handleImageUpload}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                setPreviewUrl={setPreviewUrl}
              />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab
                encryptionLevel={encryptionLevel}
                setEncryptionLevel={setEncryptionLevel}
              />
            </TabsContent>

            <TabsContent value="bidding">
              <BiddingTab
                allowBidding={allowBidding}
                setAllowBidding={setAllowBidding}
                minimumBid={minimumBid}
                setMinimumBid={setMinimumBid}
              />
            </TabsContent>
          </Tabs>

          <Button
            className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity mt-6"
            onClick={handleCreateCapsule}
            disabled={isLoading}
          >
            {isLoading ? "CREATING..." : "CREATE CAPSULE"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AICapsuleWidget;
