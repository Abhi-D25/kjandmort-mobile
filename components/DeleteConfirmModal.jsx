'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  visit, 
  onVisitDeleted 
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!visit) return

    setLoading(true)

    try {
      console.log(`🗑️ Attempting to delete visit ${visit.id} for restaurant: ${visit.restaurant_name}`)
      
      const response = await fetch(`/api/visit/${visit.id}`, {
        method: 'DELETE'
      })

      console.log(`🗑️ Delete response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`🗑️ Delete failed with status ${response.status}:`, errorText)
        throw new Error(`Failed to delete visit: ${response.status}`)
      }

      const result = await response.json()
      console.log('🗑️ Delete successful:', result)

      toast({
        title: "Visit Deleted 🗑️",
        description: `Successfully deleted your visit to ${visit.restaurant_name}`,
        variant: "default"
      })

      // Notify parent component
      if (onVisitDeleted) {
        console.log('🗑️ Calling onVisitDeleted callback')
        onVisitDeleted()
      }

      onClose()

    } catch (error) {
      console.error('Error deleting visit:', error)
      toast({
        title: "Delete Failed",
        description: "Could not delete the visit. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !visit) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Delete Visit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-gray-800 mb-2">
              Are you sure you want to delete this restaurant visit?
            </p>
            
            <div className="bg-white p-3 rounded border">
              <p className="font-semibold text-gray-900">{visit.restaurant_name}</p>
              <p className="text-sm text-gray-600">{visit.location}</p>
              {visit.visit_date && (
                <p className="text-sm text-gray-500">
                  {new Date(visit.visit_date).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <p className="text-red-700 text-sm mt-3 font-medium">
              This action cannot be undone. The visit will be permanently removed from your cuisine tour.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Deleting...' : 'Delete Visit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}