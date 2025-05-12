'use client';

import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Question } from '../types';

interface QuestionCardProps {
    question: Question;
    handleAnswerChange: (id: string, value: string) => void;
    submitAnswer: (id: string) => void;
    toggleFeedback: (id: string) => void;
    readOnly?: boolean;
}

export function QuestionCard({
    question,
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,
    readOnly = false
}: QuestionCardProps) {
    return (
        <Card>
            {/* Question */}
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Question</CardTitle>
                <p className="text-gray-700 mt-1 font-normal">{question.text}</p>
            </CardHeader>

            {/* Answer Section */}
            <CardContent>
                <Textarea
                    placeholder="Type your answer here..."
                    className={`min-h-32 mb-4 ${question.isAnswered ? 'bg-gray-50' : 'bg-white'
                        }`}
                    value={question.userAnswer}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    disabled={question.isAnswered || readOnly}
                />

                {!question.isAnswered || readOnly ? (
                    <Button
                        onClick={() => submitAnswer(question.id)}
                        disabled={!question.userAnswer || question.isSubmitting}
                    >
                        {question.isSubmitting ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Answer
                            </>
                        )}
                    </Button>
                ) : (
                    <Collapsible
                        open={question.showFeedback}
                        onOpenChange={() => toggleFeedback(question.id)}
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="secondary"
                                className="w-full justify-between"
                            >
                                <span>Feedback</span>
                                {question.showFeedback ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <div className="mt-4 pt-4">
                                <Separator className="mb-4" />
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Feedback</h4>
                                <div className="p-4 bg-blue-50 rounded-lg text-gray-700 text-sm">
                                    {question.feedback}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>
        </Card>
    );
}