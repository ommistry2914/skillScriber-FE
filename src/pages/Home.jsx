import {
  FileText,
  Upload,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Download,
  FileDown,
  Plus,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import docsService from "@/services/docs/docs.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody,TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Home = () => {
  const [jobDescription, setJobDescription] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState({ job: false, resume: false });

  // Refs for file inputs
  const jobDescriptionInputRef = useRef(null);
  const resumesInputRef = useRef(null);

  // React Query mutation for uploading documents
  const uploadMutation = useMutation({
    mutationFn: (formData) => docsService.uploadDocs(formData),
    onSuccess: (data) => {
      // Reset form on successful upload
      setJobDescription(null);
      setResumes([]);
      if (jobDescriptionInputRef.current)
        jobDescriptionInputRef.current.value = "";
      if (resumesInputRef.current) resumesInputRef.current.value = "";
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

  const handleJobDescriptionChange = (files) => {
    const file = files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Job description file size must be less than 5MB");
        setJobDescription(null);
        return;
      }

      // Check file type
      if (
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        setJobDescription(file);
        setError(null);
      } else {
        setError("Please select a PDF or DOCX file for job description");
        setJobDescription(null);
      }
    }
  };

  const handleResumeChange = (newFiles) => {
    // Convert FileList to Array and combine with existing resumes
    const files = Array.from(newFiles);
    const combinedFiles = [...resumes, ...files];

    // Check total number of files
    if (combinedFiles.length > 3) {
      setError("Maximum 3 resumes allowed");
      return;
    }

    // Check file sizes and types
    const invalidSizeFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidSizeFiles.length > 0) {
      setError(`File size too large: ${invalidSizeFiles.map(f => f.name).join(", ")}. Maximum 5MB per file.`);
      return;
    }

    const validFiles = files.filter(file =>
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    );

    if (validFiles.length !== files.length) {
      const invalidFiles = files.filter(file => !validFiles.includes(file));
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(", ")}. Only PDF and DOCX files allowed.`);
      return;
    }

    // Check for duplicate files
    const newValidFiles = validFiles.filter(newFile => 
      !resumes.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size
      )
    );

    if (newValidFiles.length === 0) {
      setError("No new files to add. Files may already be uploaded or invalid.");
      return;
    }

    setResumes(prev => [...prev, ...newValidFiles]);
    setError(null);
  };

  const removeJobDescription = () => {
    setJobDescription(null);
    if (jobDescriptionInputRef.current) {
      jobDescriptionInputRef.current.value = "";
    }
  };

  const removeResume = (indexToRemove) => {
    const updatedResumes = resumes.filter((_, index) => index !== indexToRemove);
    setResumes(updatedResumes);

    if (updatedResumes.length === 0 && resumesInputRef.current) {
      resumesInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!jobDescription || resumes.length === 0) {
      setError("Please upload both job description and at least one resume");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);

    resumes.forEach((resume) => {
      formData.append("resumes", resume);
    });

    // Call the mutation
    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetForm = () => {
    setJobDescription(null);
    setResumes([]);
    setError(null);
    if (jobDescriptionInputRef.current)
      jobDescriptionInputRef.current.value = "";
    if (resumesInputRef.current) resumesInputRef.current.value = "";
    uploadMutation.reset();
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'job') {
        handleJobDescriptionChange(e.dataTransfer.files);
      } else {
        handleResumeChange(e.dataTransfer.files);
      }
    }
  }, [resumes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Job Resume Matcher
          </h1>
          <p className="text-lg text-gray-600">
            Upload job descriptions and resumes for intelligent matching
          </p>
        </div>

        {/* Upload Section - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Description Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <FileText className="h-6 w-6 text-blue-500" />
                <span>Job Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 text-center ${
                  dragActive.job 
                    ? 'border-blue-500 bg-blue-50 border-solid' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
                onDragEnter={(e) => handleDrag(e, 'job')}
                onDragLeave={(e) => handleDrag(e, 'job')}
                onDragOver={(e) => handleDrag(e, 'job')}
                onDrop={(e) => handleDrop(e, 'job')}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Drag & drop your job description here
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  PDF or DOCX files only (Max 5MB)
                </p>
                
                <input
                  ref={jobDescriptionInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => handleJobDescriptionChange(e.target.files)}
                  className="hidden"
                />
                
                <Button 
                  variant="outline" 
                  onClick={() => jobDescriptionInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="mb-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                
                {jobDescription && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-800 truncate">
                            {jobDescription.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(jobDescription.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeJobDescription}
                        disabled={uploadMutation.isPending}
                        className="text-green-600 hover:text-green-800 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-green-500" />
                  <span>Resumes</span>
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {resumes.length}/3 files
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 text-center ${
                  dragActive.resume 
                    ? 'border-green-500 bg-green-50 border-solid' 
                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                }`}
                onDragEnter={(e) => handleDrag(e, 'resume')}
                onDragLeave={(e) => handleDrag(e, 'resume')}
                onDragOver={(e) => handleDrag(e, 'resume')}
                onDrop={(e) => handleDrop(e, 'resume')}
              >
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Drag & drop resumes here
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  PDF or DOCX files only (Max 5MB each, 3 files max)
                </p>
                
                <input
                  ref={resumesInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  multiple
                  onChange={(e) => handleResumeChange(e.target.files)}
                  className="hidden"
                />
                
                <Button 
                  variant="outline" 
                  onClick={() => resumesInputRef.current?.click()}
                  disabled={resumes.length >= 3 || uploadMutation.isPending}
                  className="mb-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {resumes.length === 0 ? 'Add Resumes' : 'Add More Resumes'}
                </Button>
                
                {resumes.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {resumes.map((resume, index) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-800 truncate">
                                {resume.name}
                              </p>
                              <p className="text-xs text-green-600">
                                {formatFileSize(resume.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeResume(index)}
                            disabled={uploadMutation.isPending}
                            className="text-green-600 hover:text-green-800 h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setError(null)}
                className="h-6 w-6 text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {uploadMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{uploadMutation.error?.message || "Upload failed. Please try again."}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => uploadMutation.reset()}
                className="h-6 w-6 text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
          <Button
            onClick={handleSubmit}
            disabled={!jobDescription || resumes.length === 0 || uploadMutation.isPending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing Files...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload & Process Files
              </>
            )}
          </Button>

          {(jobDescription || resumes.length > 0 || uploadMutation.isSuccess || error || uploadMutation.isError) && (
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={uploadMutation.isPending}
              size="lg"
              className="w-full sm:w-auto"
            >
              Reset Form
            </Button>
          )}
        </div>

        {/* Results Table */}
        {uploadMutation.isSuccess && uploadMutation.data && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>Processing Complete!</span>
              </CardTitle>
              <p className="text-gray-600">
                Your job-resume matching analysis is ready. Download the reports below:
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-20 font-semibold text-gray-900">Sr. No.</TableHead>
                      <TableHead className="font-semibold text-gray-900">Candidate Name</TableHead>
                      <TableHead className="text-center font-semibold text-gray-900 min-w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadMutation.data.reports.map((report, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {report.candidateName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(report.s3Files.docx, '_blank')}
                              className="flex items-center justify-center min-w-[100px]"
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              DOCX
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(report.s3Files.pdf, '_blank')}
                              className="flex items-center justify-center min-w-[100px] text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Summary:</strong> Successfully processed {resumes.length} resume{resumes.length > 1 ? 's' : ''} against the job description. 
                  All reports are available for download in both DOCX and PDF formats.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;