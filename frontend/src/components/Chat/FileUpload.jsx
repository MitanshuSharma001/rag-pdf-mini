import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { uploadPDF } from '../../services/api'
import { useSocket } from '../../hooks/useSocket'
import toast from 'react-hot-toast'

const FileUpload = ({ currentChat, userId, isProcessing, statusMessage }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { socket } = useSocket()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed')
        return
      }
      if (file.size > 35 * 1024 * 1024) {
        toast.error('File size must be less than 35MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file')
      return
    }

    try {
      setUploading(true)
      
      // Upload file to backend
      const response = await uploadPDF(selectedFile)
      const { filePath, fileName } = response.data

      // Emit socket event to process PDF
      if (socket) {
        socket.emit('upload-pdf', {
          chatId: currentChat.id,
          userId: userId,
          filePath: filePath,
          fileName: fileName
        })
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'File upload failed')
      setUploading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl p-8" style={{boxShadow:'0 4px 12px rgba(0, 0, 0, 0.08)'}}>
          {isProcessing || uploading ? (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#3DD598] mx-auto mb-4 animate-spin" />
              <h3 className="text-2xl font-bold text-[gray] mb-2">Processing PDF</h3>
              <p className="text-[#6c6b6b]">{statusMessage || 'Working upon it...'}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#E6FBF0] p-4 rounded-full">
                    <Upload className="w-12 h-12 text-[#3DD598]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#212529] mb-2">Upload PDF Document</h3>
                <p className="text-[#6C757D]">Upload a PDF file to start asking questions</p>
              </div>

              <div className="mb-6">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed bg-[#F8F9FA] border-[#DEE2E6] rounded-lg p-8 text-center hover:border-[gray] transition-colors">
                    {selectedFile ? (
                      <div className="flex items-center justify-center">
                        <FileText className="w-8 h-8 text-black mr-3" />
                        <div className="text-left">
                          <p className="text-[#494949] font-semibold">{selectedFile.name}</p>
                          <p className="text-[#9a9999] text-sm">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-[#3DD598] mx-auto mb-3" />
                        <p className="text-[#212529] font-semibold mb-1">Click to upload PDF</p>
                        <p className="text-[#6C757D] text-sm">Maximum file size: 35MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <button
                  onClick={handleUpload}
                  className="w-full bg-gradient-to-r from-[#3DD598] to-[#50D890] text-[#FFFFFF] py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Upload and Process
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default FileUpload