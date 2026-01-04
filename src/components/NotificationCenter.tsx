import { useState } from 'react';
import { Bell, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const notifications: any[] = []; // Notifications endpoint not available in backend

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Bell className="w-8 h-8 mb-2 opacity-50" />
            <p>Notifications endpoint not available</p>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
