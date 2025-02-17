import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Report({ session }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [session]);

  async function fetchResults() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          questions (
            question,
            type,
            correct_answer
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedResults = processResults(data);
      setResults(processedResults);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function processResults(data) {
    if (!data || data.length === 0) return null;

    const totalQuestions = data.length;
    const correctAnswers = data.filter((answer) => answer.is_correct).length;
    const score = (correctAnswers / totalQuestions) * 100;

    const byType = data.reduce((acc, answer) => {
      const type = answer.questions.type;
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          correct: 0,
        };
      }
      acc[type].total += 1;
      if (answer.is_correct) {
        acc[type].correct += 1;
      }
      return acc;
    }, {});

    return {
      totalQuestions,
      correctAnswers,
      score,
      byType,
      details: data,
    };
  }

  if (loading) {
    return <div className="text-center py-12">Loading results...</div>;
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Results Available</h2>
          <p className="mb-4">You haven't completed any tests yet.</p>
          <Link
            to="/questions"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Start a Test
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Test Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Overall Score</h3>
              <p className="text-3xl font-bold text-indigo-600">{results.score.toFixed(1)}%</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Correct Answers</h3>
              <p className="text-3xl font-bold text-green-600">
                {results.correctAnswers}/{results.totalQuestions}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Questions</h3>
              <p className="text-3xl font-bold text-blue-600">{results.totalQuestions}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Performance by Category</h3>
            {Object.entries(results.byType).map(([type, data]) => (
              <div key={type} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 capitalize">{type}</span>
                  <span className="text-gray-900 font-medium">
                    {((data.correct / data.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${(data.correct / data.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Profile
            </Link>
            <Link
              to="/questions"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Take Another Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}