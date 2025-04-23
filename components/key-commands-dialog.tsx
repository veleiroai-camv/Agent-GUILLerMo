import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KeyCommandsDialogProps {
  open: boolean
  onClose: () => void
}

export function KeyCommandsDialog({ open, onClose }: KeyCommandsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Key Commands</DialogTitle>
          <DialogDescription>Keyboard shortcuts and mouse commands for the graph editor.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            <div>
              <h3 className="font-medium">Create a node</h3>
              <p className="text-sm text-muted-foreground">+ + click anywhere on the canvas</p>
            </div>
            <div>
              <h3 className="font-medium">Create an edge</h3>
              <p className="text-sm text-muted-foreground">
                click + drag from the bottom of one node to the top of another
              </p>
            </div>
            <div>
              <h3 className="font-medium">Create a conditional edge</h3>
              <p className="text-sm text-muted-foreground">connect one node to multiple nodes</p>
            </div>
            <div>
              <h3 className="font-medium">Create a cycle</h3>
              <p className="text-sm text-muted-foreground">click + drag from the bottom to the top of a node</p>
            </div>
            <div>
              <h3 className="font-medium">Delete an edge/node</h3>
              <p className="text-sm text-muted-foreground">click the edge/node and hit the backspace key</p>
            </div>
            <div>
              <h3 className="font-medium">Color an edge</h3>
              <p className="text-sm text-muted-foreground">click the edge and select an option from the color picker</p>
            </div>
            <div>
              <h3 className="font-medium">Pan the canvas</h3>
              <p className="text-sm text-muted-foreground">click + drag on empty canvas area</p>
            </div>
            <div>
              <h3 className="font-medium">Zoom in/out</h3>
              <p className="text-sm text-muted-foreground">scroll up/down or use the zoom controls</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
