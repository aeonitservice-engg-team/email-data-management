'use client';

import { useState } from 'react';

interface VerificationResult {
  success: boolean;
  message: string;
  connection: boolean;
  tables?: Record<string, any>;
  errors?: string[];
  error?: string;
  hint?: string;
}

interface TestCredentials {
  username: string;
  password: string;
}

export default function VerifyDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [credentials, setCredentials] = useState<TestCredentials>({
    username: 'root',
    password: '',
  });

  const verifyDatabase = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/verify-db');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to API',
        connection: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEnvFile = async (username: string, password: string) => {
    try {
      // Create the DATABASE_URL string
      const databaseUrl = `mysql://${username}${password ? ':' + password : ''}@localhost:3306/email_data_management`;
      
      const response = await fetch('/api/update-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseUrl }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ .env.local updated successfully!\n\nPlease restart the dev server:\n1. Press Ctrl+C in the terminal\n2. Run: pnpm dev\n\nThen come back to verify the connection.');
        
        // Auto-verify after a delay
        setTimeout(() => {
          verifyDatabase();
        }, 2000);
      } else {
        alert('❌ Failed to update .env.local: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error updating credentials: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Verification</h1>
          <p className="text-gray-600">Check database connection and fix credentials</p>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-yellow-400">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Update MySQL Credentials</h2>
          <p className="text-gray-600 mb-4">Enter your MySQL username and password:</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                MySQL Username
              </label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="root"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                MySQL Password (leave empty if no password)
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="your mysql password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> If you're using MAMP/XAMPP, the default MySQL credentials are usually:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Username: <code className="bg-blue-100 px-2 py-1 rounded">root</code></li>
                <li>Password: <code className="bg-blue-100 px-2 py-1 rounded">root</code> (MAMP) or empty (XAMPP)</li>
              </ul>
            </div>

            <button
              onClick={() => updateEnvFile(credentials.username, credentials.password)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Update Credentials & Restart
            </button>
          </div>
        </div>

        {/* Verification Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Verify Connection</h2>
          <p className="text-gray-600 mb-4">After updating credentials and restarting the server, click below to verify:</p>
          
          <button
            onClick={verifyDatabase}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Database Connection'
            )}
          </button>
        </div>

        {result && (
          <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            result.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="flex items-center mb-4">
              {result.success ? (
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <h2 className={`text-xl font-semibold ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Connection Status */}
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Database Connection</span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    result.connection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.connection ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>

              {/* Tables Status */}
              {result.tables && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tables Status</h3>
                  <div className="space-y-3">
                    {Object.entries(result.tables).map(([tableName, tableInfo]: [string, any]) => (
                      <div key={tableName} className="bg-gray-50 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">{tableName}</span>
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            tableInfo.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tableInfo.exists ? `${tableInfo.count} records` : 'Missing'}
                          </span>
                        </div>
                        {tableInfo.error && (
                          <p className="text-sm text-red-600 mt-2 font-mono">{tableInfo.error}</p>
                        )}
                        {tableInfo.sample && tableInfo.sample.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                              View sample data
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(tableInfo.sample, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {result.errors.map((error, index) => (
                      <li key={index} className="font-mono">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error Details */}
              {result.error && (
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
                  <p className="text-sm text-red-700 font-mono">{result.error}</p>
                </div>
              )}

              {/* Hint */}
              {result.hint && (
                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-800">Next Steps</p>
                      <p className="text-sm text-yellow-700 mt-1">{result.hint}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Actions */}
              {result.success && (
                <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800 mb-2">Database is ready!</p>
                      <p className="text-sm text-green-700">You can now:</p>
                      <ul className="list-disc list-inside text-sm text-green-700 mt-1 ml-4">
                        <li>Import email contacts at <a href="/import" className="underline hover:text-green-900">/import</a></li>
                        <li>View analytics at <a href="/" className="underline hover:text-green-900">/dashboard</a></li>
                        <li>Manage brands and journals</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
