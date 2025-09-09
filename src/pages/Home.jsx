import { FileText, Upload, Users, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import React, { useState, useRef } from 'react'

const Home = () => {
  const [jobDescription, setJobDescription] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs for file inputs
  const jobDescriptionInputRef = useRef(null);
  const resumesInputRef = useRef(null);

  const handleJobDescriptionChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Job description file size must be less than 5MB');
        setJobDescription(null);
        return;
      }

      // Check file type
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword') {
        setJobDescription(file);
        setError(null);
      } else {
        setError('Please select a PDF or DOCX file for job description');
        setJobDescription(null);
      }
    }
  };

  const handleResumeChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check number of files
    if (files.length > 3) {
      setError('Maximum 3 resumes allowed');
      return;
    }

    // Check file sizes and types
    const invalidSizeFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidSizeFiles.length > 0) {
      setError(`File size too large: ${invalidSizeFiles.map(f => f.name).join(', ')}. Maximum 5MB per file.`);
      return;
    }

    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    );

    if (validFiles.length !== files.length) {
      const invalidFiles = files.filter(file => !validFiles.includes(file));
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only PDF and DOCX files allowed.`);
      return;
    }

    setResumes(validFiles);
    setError(null);
  };

  const removeJobDescription = () => {
    setJobDescription(null);
    if (jobDescriptionInputRef.current) {
      jobDescriptionInputRef.current.value = '';
    }
  };

  const removeResume = (indexToRemove) => {
    const updatedResumes = resumes.filter((_, index) => index !== indexToRemove);
    setResumes(updatedResumes);
    
    if (updatedResumes.length === 0 && resumesInputRef.current) {
      resumesInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!jobDescription || resumes.length === 0) {
      setError('Please upload both job description and at least one resume');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    
    resumes.forEach((resume) => {
      formData.append('resumes', resume);
    });

    try {
      const response = await fetch('http://localhost:3000/v1/docs/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadResult(result.data);
        // Reset form
        setJobDescription(null);
        setResumes([]);
        if (jobDescriptionInputRef.current) jobDescriptionInputRef.current.value = '';
        if (resumesInputRef.current) resumesInputRef.current.value = '';
      } else {
        setError(result.message || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check if the server is running on http://localhost:5000');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setJobDescription(null);
    setResumes([]);
    setError(null);
    setUploadResult(null);
    if (jobDescriptionInputRef.current) jobDescriptionInputRef.current.value = '';
    if (resumesInputRef.current) resumesInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Job Resume Matcher
          </h1>
          <p className="text-lg text-gray-600">
            Upload job descriptions and resumes for intelligent matching
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="space-y-8">
            {/* Job Description Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Job Description
                </h3>
                <p className="text-gray-600 mb-4">
                  Select a PDF or DOCX file containing the job description (Max 5MB)
                </p>
                <input
                  ref={jobDescriptionInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleJobDescriptionChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    file:cursor-pointer cursor-pointer"
                />
                {jobDescription && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {jobDescription.name}
                        </span>
                        <span className="text-sm text-green-600">
                          ({formatFileSize(jobDescription.size)})
                        </span>
                      </div>
                      <button
                        onClick={removeJobDescription}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Resumes
                </h3>
                <p className="text-gray-600 mb-4">
                  Select 1-3 PDF or DOCX resume files (Max 5MB each)
                </p>
                <input
                  ref={resumesInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  multiple
                  onChange={handleResumeChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    file:cursor-pointer cursor-pointer"
                />
                {resumes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {resumes.map((resume, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {resume.name}
                            </span>
                            <span className="text-sm text-green-600">
                              ({formatFileSize(resume.size)})
                            </span>
                          </div>
                          <button
                            onClick={() => removeResume(index)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-2">
                      {resumes.length}/3 resumes selected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadResult && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Upload Successful!
                    </h3>
                  </div>
                  <button
                    onClick={() => setUploadResult(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>Submission ID:</strong> {uploadResult.submissionId}</p>
                  <p><strong>Job Description Length:</strong> {uploadResult.jobDescriptionLength} characters</p>
                  <p><strong>Resumes Processed:</strong> {uploadResult.resumeCount}</p>
                  <p><strong>Processed At:</strong> {new Date(uploadResult.processedAt).toLocaleString()}</p>
                  <div>
                    <strong>Resume Details:</strong>
                    <ul className="mt-2 ml-4 space-y-1">
                      {uploadResult.resumes.map((resume, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span>• {resume.originalName} - {resume.textLength} characters extracted</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSubmit}
                disabled={!jobDescription || resumes.length === 0 || uploading}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
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
              </button>
              
              {(jobDescription || resumes.length > 0 || uploadResult || error) && (
                <button
                  onClick={resetForm}
                  disabled={uploading}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset Form
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>Upload one job description file (PDF or DOCX format, max 5MB)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Upload 1-3 resume files (PDF or DOCX format, max 5MB each)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Click "Upload & Process Files" to extract text and process documents</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>The system will extract text content and provide processing results</span>
            </li>
          </ul>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Files are processed and then automatically deleted from the server</li>
              <li>• Only PDF and DOCX files are supported</li>
              <li>• Maximum file size is 5MB per file</li>
              <li>• Extracted text is used for matching analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home