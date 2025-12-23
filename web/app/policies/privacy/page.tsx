import { AppConfig } from '@/lib/constants';
import { formatISOToHumanReadable } from '@/lib/helpers';

export default function Privacy() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>Privacy Policy</h1>
        </div>
        <div className='space-y-6'>
          <div>
            <h2 className='text-xl font-semibold'>1. Introduction</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              Welcome to {AppConfig.APP_NAME}! This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              visit our website. By using our services, you agree to the terms
              outlined in this policy.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>2. Information We Collect</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              We may collect information that you voluntarily provide, such as
              your name, email address, and payment information, as well as
              automatically collected data such as your IP address, browser
              type, and interaction data.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>
              3. How We Use Your Information
            </h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              We use your information to provide and improve our services,
              respond to inquiries, process transactions, and for analytics.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>4. Sharing of Information</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              {AppConfig.APP_NAME} does not share your personal information with
              third parties except as necessary to fulfill services (e.g.,
              payment processing) or as required by law.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>5. Data Security</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              We use industry-standard security measures to protect your
              information. However, please be aware that no data transmission
              over the internet is completely secure.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>6. Your Privacy Rights</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              Depending on your location, you may have certain rights regarding
              your data, such as access, correction, deletion, and opting out of
              data collection. Contact us to exercise your rights.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>7. Changes to This Policy</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              We may update this Privacy Policy periodically. By continuing to
              use our website after changes are posted, you agree to the revised
              policy.
            </p>
          </div>
          <hr className='border-gray-200' />

          <div>
            <h2 className='text-xl font-semibold'>8. Contact Us</h2>
            <p className='text-sm leading-6 text-gray-700 mt-2'>
              If you have questions about this Privacy Policy, please contact us
              at {AppConfig.CONTACT_EMAIL}.
            </p>
          </div>
          <hr className='border-gray-200' />

          <ul className='list-disc pl-6 text-sm text-gray-700'>
            <li>
              <strong>Effective Date:</strong>{' '}
              {formatISOToHumanReadable(AppConfig.ADMIN.PRIVACY_DATE)}
            </li>
            <li>
              <strong>Last Updated:</strong>{' '}
              {formatISOToHumanReadable(AppConfig.ADMIN.PRIVACY_DATE)}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
