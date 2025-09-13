import { Button } from '@/components/ui/button';
import testService from '@/services/docs/test.service';
import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const Setting = () => {

  const { user } = useSelector((state) => state.auth);

  const testMutation = useMutation({
    mutationFn: (data) => testService.checkTest(data),
    onSuccess: (data) => {
      toast.success("Test checked successfully");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError("Network error. Please check if the server is running");
      } else {
        setError(
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again."
        );
      }
    },
  });


  return (
    <div>
      <Button onClick={() => {
        testMutation.mutate({ user });
      }}>
        Test Api
      </Button>
    </div>
  )
}

export default Setting