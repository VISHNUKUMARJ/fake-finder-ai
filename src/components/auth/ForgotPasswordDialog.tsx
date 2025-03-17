
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ForgotPasswordDialog = ({ open, onClose }: ForgotPasswordDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<'email' | 'reset'>('email');
  const [resetError, setResetError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setResetError("");
    
    if (resetStep === 'email') {
      try {
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/login`
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password."
        });
        
        // Close the dialog after successful email send
        onClose();
        setResetEmail("");
      } catch (error: any) {
        setResetError(error.message || "Failed to send reset email.");
      }
    } else {
      // Validate passwords match
      if (newPassword !== confirmNewPassword) {
        setResetError("Passwords don't match.");
        return;
      }
      
      if (newPassword.length < 6) {
        setResetError("Password must be at least 6 characters long.");
        return;
      }
      
      try {
        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          throw error;
        }
        
        // Show success toast
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. You can now log in."
        });
        
        // Close the dialog and reset state
        onClose();
        setNewPassword("");
        setConfirmNewPassword("");
        setResetStep('email');
      } catch (error: any) {
        setResetError(error.message || "Failed to update password.");
      }
    }
  };

  const handleClose = () => {
    onClose();
    setResetEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResetStep('email');
    setResetError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            {resetStep === 'email' 
              ? "Enter your email address and we'll send you a reset link." 
              : "Enter your new password below."}
          </DialogDescription>
        </DialogHeader>
        
        {resetError && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription>{resetError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          {resetStep === 'email' ? (
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {resetStep === 'email' ? 'Send Reset Link' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
