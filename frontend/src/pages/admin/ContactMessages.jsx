import { useState, useEffect } from 'react'
import { adminContactAPI } from '../../services/api'

function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadMessages()
    loadUnreadCount()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await adminContactAPI.getAll()
      setMessages(response.data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await adminContactAPI.getUnreadCount()
      setUnreadCount(response.data?.unreadCount || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await adminContactAPI.markAsRead(id)
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, isRead: true } : msg
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true })
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      alert('Có lỗi xảy ra khi đánh dấu đã đọc!')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  const unreadMessages = messages.filter(msg => !msg.isRead)
  const readMessages = messages.filter(msg => msg.isRead)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Tin Nhắn Liên Hệ</h1>
        {unreadCount > 0 && (
          <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
            {unreadCount} tin nhắn chưa đọc
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Unread Messages */}
            {unreadMessages.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold mb-4 text-red-600">
                  Chưa đọc ({unreadMessages.length})
                </h2>
                <div className="space-y-3">
                  {unreadMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                        selectedMessage?.id === message.id
                          ? 'border-vest-gold bg-vest-gold/5'
                          : 'border-red-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{message.subject}</h3>
                          <p className="text-sm text-gray-600 mb-2">{message.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                        </div>
                        <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Read Messages */}
            {readMessages.length > 0 && (
              <div className={unreadMessages.length > 0 ? 'mt-8' : ''}>
                <h2 className="text-xl font-serif font-bold mb-4 text-gray-600">
                  Đã đọc ({readMessages.length})
                </h2>
                <div className="space-y-3">
                  {readMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                        selectedMessage?.id === message.id
                          ? 'border-vest-gold bg-vest-gold/5'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 text-gray-700">{message.subject}</h3>
                          <p className="text-sm text-gray-600 mb-2">{message.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">Không có tin nhắn nào</p>
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-serif font-bold">Chi tiết tin nhắn</h2>
                  {!selectedMessage.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="px-4 py-2 bg-vest-gold text-vest-dark rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tiêu đề</label>
                    <p className="text-lg font-semibold mt-1">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                    <p className="mt-1">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1">{selectedMessage.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                    <p className="mt-1">{selectedMessage.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày gửi</label>
                    <p className="mt-1">{formatDate(selectedMessage.createdAt)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Nội dung</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedMessage.isRead
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMessage.isRead ? 'Đã đọc' : 'Chưa đọc'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">Chọn một tin nhắn để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactMessages

