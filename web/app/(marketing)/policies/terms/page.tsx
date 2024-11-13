import {
  Card,
  CardContent,
  CardHeader,
  Separator,
} from '@/components/ui';
import { AppConfig } from '@/lib/constants';
import { formatISOToHumanReadable } from '@/lib/helpers';

export default function Terms() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold'>Terms and Conditions</h1>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold'>1. Introduction</h2>
            <p className='text-sm leading-6 text-gray-700'>
              Welcome to {AppConfig.APP_NAME}! These Terms and Conditions govern
              your use of our website and services. By accessing or using our
              website, you agree to comply with and be bound by these terms.
            </p>
            <Separator />

            <h2 className='text-xl font-semibold'>
              2. Intellectual Property Rights
            </h2>
            <p className='text-sm leading-6 text-gray-700'>
              All content, trademarks, and other intellectual property displayed
              on our website are owned by {AppConfig.APP_NAME} or used with
              permission. Unauthorized use of our content is prohibited.
            </p>
            <Separator />

            <h2 className='text-xl font-semibold'>3. User Responsibilities</h2>
            <p className='text-sm leading-6 text-gray-700'>
              As a user of our website, you agree not to engage in prohibited
              activities, including but not limited to distributing malware,
              infringing on intellectual property rights, or using our website
              for unlawful purposes.
            </p>
            <Separator />

            <h2 className='text-xl font-semibold'>
              4. Limitation of Liability
            </h2>
            <p className='text-sm leading-6 text-gray-700'>
              {AppConfig.APP_NAME} is not responsible for any damages resulting
              from the use or inability to use our website or services. This
              includes but is not limited to direct, indirect, or consequential
              damages.
            </p>
            <Separator />

            <h2 className='text-xl font-semibold'>5. Governing Law</h2>
            <p className='text-sm leading-6 text-gray-700'>
              These Terms and your use of {AppConfig.APP_NAME} will be governed
              by and construed in accordance with US & EU laws.
            </p>
            <Separator />

            <h2 className='text-xl font-semibold'>6. Changes to These Terms</h2>
            <p className='text-sm leading-6 text-gray-700'>
              We may update these Terms and Conditions periodically. By
              continuing to use our website after changes are posted, you agree
              to the updated terms.
            </p>
            <Separator />

            <h2 className='text-xl font-semibold'>7. Contact Us</h2>
            <p className='text-sm leading-6 text-gray-700'>
              If you have questions about these Terms and Conditions, please
              contact us at {AppConfig.CONTACT_EMAIL}.
            </p>
            <Separator />

            <ul className='list-disc pl-6 text-sm text-gray-700'>
              <li>
                <strong>Effective Date:</strong>{' '}
                {formatISOToHumanReadable(AppConfig.ADMIN.TERMS_DATE)}
              </li>
              <li>
                <strong>Last Updated:</strong>{' '}
                {formatISOToHumanReadable(AppConfig.ADMIN.TERMS_DATE)}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
