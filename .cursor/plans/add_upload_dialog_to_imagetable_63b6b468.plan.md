---
name: Add Upload Dialog to ImageTable
overview: Copy the image upload dialog from PlaceTable.tsx and add it to ImageTable.tsx with an "Upload Image" button in the header. The dialog will allow uploading images directly from the image management view.
todos:
  - id: add-imports
    content: Add ImagePlus icon and PlaceImageUploadForm imports
    status: completed
  - id: add-state
    content: Add isUploadDialogOpen state variable
    status: completed
  - id: add-button
    content: Add Upload Image button in the header
    status: completed
  - id: add-dialog
    content: Add Image Upload Dialog component
    status: completed
---

# Add Image Upload Dialog to ImageTable

## Changes to [src/components/admin/ImageTable.tsx](src/components/admin/ImageTable.tsx)

### 1. Add new imports

- Add `ImagePlus` to the lucide-react imports (line 2)
- Add `PlaceImageUploadForm` import after line 23:
```tsx
import { PlaceImageUploadForm } from "./PlaceImageUploadForm";
```




### 2. Add upload dialog state

Add a new state variable after `isFormOpen` (around line 56):

```tsx
const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
```



### 3. Add "Upload Image" button in header

Replace the empty space in lines 115-118 with:

```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold">Images</h2>
  <Button onClick={() => setIsUploadDialogOpen(true)} size="sm">
    <ImagePlus className="size-4 mr-1" />
    Upload Image
  </Button>
</div>
```



### 4. Add Image Upload Dialog

Add the dialog after the Delete Confirmation Dialog (after line 265, before closing `</div>`):

```tsx
{/* Image Upload Dialog */}
<Dialog
  open={isUploadDialogOpen}
  onOpenChange={setIsUploadDialogOpen}
>
  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Upload Image</DialogTitle>
      <DialogDescription>
        Upload an image for this place. EXIF metadata (location and capture time) will be extracted automatically.
      </DialogDescription>
    </DialogHeader>
    <PlaceImageUploadForm
      placeId={placeId}
      onSuccess={() => setIsUploadDialogOpen(false)}
      onCancel={() => setIsUploadDialogOpen(false)}
    />
  </DialogContent>
</Dialog>

```