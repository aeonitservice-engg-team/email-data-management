'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  serverVersion?: string;
  database?: string;
  connectionId?: number;
  timestamp: string;
  error?: string;
}

interface ConnectionConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>({
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: 'root',
    database: 'email_data_management',
  });

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: config.host,
          port: parseInt(config.port) || 3306,
          username: config.username,
          password: config.password,
          database: config.database,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to API',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const copyErrorToClipboard = () => {
    if (result?.error) {
      navigator.clipboard.writeText(result.error);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInputChange = (field: keyof ConnectionConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = config.host && config.username && config.database;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MySQL Database Connection Test</h1>
          <p className="text-gray-600">Test your MySQL database connection and view server information</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Details</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Local Connection Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>MAMP/XAMPP typically uses port <strong>8889</strong> or <strong>3306</strong></li>
                  <li>Default username is usually <strong>root</strong></li>
                  <li>Check your local MySQL is running</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                  Host <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="host"
                  value={config.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="e.g., colloquys.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                  Port
                </label>
                <input
                  type="text"
                  id="port"
                  value={config.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  placeholder="3306"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">
                Database Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="database"
                value={config.database}
                onChange={(e) => handleInputChange('database', e.target.value)}
                placeholder="e.g., email_data"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                value={config.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Database username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={config.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Database password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={testConnection}
            disabled={loading || !isFormValid}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing Connection...
              </>
            ) : (
              'Test Database Connection'
            )}
          </button>

          {!isFormValid && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              Please fill in all required fields (*)
            </p>
          )}
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
                {result.success ? 'Connection Successful' : 'Connection Failed'}
              </h2>
            </div>

            <div className="space-y-3">
              {result.success && result.serverVersion && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-500">MySQL Server Version</p>
                  <p className="text-gray-900 font-mono text-sm mt-1">{result.serverVersion}</p>
                </div>
              )}

              {result.success && result.database && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-500">Database Name</p>
                  <p className="text-gray-900 font-mono text-sm mt-1">{result.database}</p>
                </div>
              )}

              {result.success && result.connectionId && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-500">Connection ID</p>
                  <p className="text-gray-900 font-mono text-sm mt-1">{result.connectionId}</p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-500">Timestamp</p>
                <p className="text-gray-900 font-mono text-sm mt-1">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>

              {result.error && (
                <div className="bg-red-50 p-3 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-1">Error Message</p>
                      <p className="text-red-700 font-mono text-sm break-all">{result.error}</p>
                    </div>
                    <button
                      onClick={copyErrorToClipboard}
                      className="ml-3 flex-shrink-0 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200"
                      title="Copy error to clipboard"
                    >
                      {copied ? (
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </span>
                      )}
                    </button>
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
