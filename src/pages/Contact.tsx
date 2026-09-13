import { useState } from 'react';
import { Mail, MessageCircle, MapPin, Clock, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  useDocumentTitle('Contact Us');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Contact form submission:', data);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setIsSubmitted(true);
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400">Have a question? We'd love to hear from you.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
            <p className="text-gray-600 dark:text-gray-400">support@campora.ng</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">We reply within 24 hours</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <MessageCircle className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</h3>
            <p className="text-gray-600 dark:text-gray-400">+234 800 CAMPORA</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Mon - Fri, 9am - 5pm</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <MapPin className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Location</h3>
            <p className="text-gray-600 dark:text-gray-400">Serving campuses across Nigeria</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Support Hours</h3>
            <p className="text-gray-600 dark:text-gray-400">Monday - Friday</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">9:00 AM - 5:00 PM WAT</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Send us a message</h2>

          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="btn-primary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="label">Name</label>
                  <input
                    {...register('name')}
                    id="contact-name"
                    type="text"
                    className="input-field"
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">Email</label>
                  <input
                    {...register('email')}
                    id="contact-email"
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="label">Subject</label>
                <input
                  {...register('subject')}
                  id="contact-subject"
                  type="text"
                  className="input-field"
                  placeholder="How can we help?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact-message" className="label">Message</label>
                <textarea
                  {...register('message')}
                  id="contact-message"
                  rows={4}
                  className="input-field"
                  placeholder="Tell us more..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
