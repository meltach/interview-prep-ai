
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, Edit, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useInterview } from '../context/InterviewContext';
import { Question } from '../types';
import { Badge } from '@/components/ui/badge';

// Custom hook for text streaming animation
function useTextAnimation(text: string, speed = 10) {
    const [streamedText, setStreamedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (!text) return;

        setIsStreaming(true);
        setStreamedText('');

        let currentIndex = 0;

        const streamInterval = setInterval(() => {
            if (currentIndex < text.length) {
                const charsToAdd = Math.floor(Math.random() * 3) + 1;
                currentIndex = Math.min(currentIndex + charsToAdd, text.length);
                setStreamedText(text.substring(0, currentIndex));
            } else {
                clearInterval(streamInterval);
                setIsStreaming(false);
            }
        }, speed);

        return () => clearInterval(streamInterval);
    }, [text, speed]);

    return { streamedText, isStreaming };
}

// Separated components for cleaner organization
function QuestionPrompt({ text }: { text: string }) {
    // Clean question text by removing quotes and leading '>'
    const cleanText = text
        .replace(/"/g, '')
        .replace(/^>\s*/, '');

    return (
        <div className="markdown-preview rounded-md">
            <ReactMarkdown>{cleanText}</ReactMarkdown>
        </div>
    );
}

type AnswerInputProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
    canSubmit: boolean;
    isEditing: boolean;
    toggleEdit: () => void;
};

function AnswerInput({
    value,
    onChange,
    disabled,
    isSubmitting,
    onSubmit,
    canSubmit,
    isEditing,
    toggleEdit
}: AnswerInputProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-700">
                    Your Answer
                </h4>
                {disabled && !isEditing && (
                    <Badge variant="outline" className="text-xs">
                        Submitted
                    </Badge>
                )}
            </div>

            <Textarea
                placeholder="Type your answer here..."
                className={`min-h-32 ${disabled && !isEditing ? 'bg-gray-50' : 'bg-white'}`}
                value={value || ''}
                onChange={onChange}
                disabled={disabled && !isEditing}
                aria-label="Your answer"
            />

            {((!disabled || isEditing)) && (
                <div className="flex gap-2">
                    <Button
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className="transition-all duration-200"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent rounded-full" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Answer
                            </>
                        )}
                    </Button>

                    {disabled && (
                        <Button
                            variant="outline"
                            onClick={toggleEdit}
                            className="transition-all duration-200"
                        >
                            {isEditing ? (
                                <>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Answer
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

type FeedbackSectionProps = {
    feedback: string;
    isOpen: boolean;
    stream: boolean;
    onToggle: () => void;
    isReadOnly: boolean;
};

function FeedbackSection({ feedback, isOpen, stream, onToggle, isReadOnly }: FeedbackSectionProps) {
    const { streamedText, isStreaming } = useTextAnimation(stream ? feedback : '');

    return (
        <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
            <CollapsibleTrigger asChild >
                <Button
                    variant="secondary"
                    className="justify-between w-full mt-4"
                >
                    <span>Feedback</span>
                    {isOpen ? (
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
                    <div className="p-4 bg-slate-50 rounded-lg text-gray-700 text-sm leading-relaxed space-y-2">
                        <div className="markdown-preview">
                            <ReactMarkdown>
                                {isReadOnly || !stream
                                    ? feedback || ''
                                    : streamedText + (isStreaming ? ' ▋' : '')
                                }
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

// Main QuestionCard component
export default function QuestionCard({ question, readOnly }:
    {
        question: Question;
        readOnly: boolean;
    }
) {
    const {
        handleAnswerChange,
        submitAnswer,
        toggleFeedback,
    } = useInterview();

    const [isEditing, setIsEditing] = useState(false);

    const handleLocalAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleAnswerChange(question.id, e.target.value);
    };

    const handleSubmit = () => {
        submitAnswer(question.id);
        setIsEditing(false);
    };

    const toggleEdit = () => setIsEditing(!isEditing);

    const canSubmit = question.userAnswer?.trim() && !question.isSubmitting;
    const isDisabled = question.isAnswered && !isEditing;

    return (
        <Card className="w-full mx-auto shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    Question
                    {question.isAnswered && (
                        <Badge variant="secondary" className="text-xs">
                            Answered
                        </Badge>
                    )}
                </CardTitle>
                <QuestionPrompt text={question.text} />
            </CardHeader>

            <CardContent>
                <AnswerInput
                    value={question.userAnswer || ''}
                    onChange={handleLocalAnswerChange}
                    disabled={isDisabled}
                    isSubmitting={question.isSubmitting || false}
                    onSubmit={handleSubmit}
                    canSubmit={canSubmit || false}
                    isEditing={isEditing}
                    toggleEdit={toggleEdit}
                />
            </CardContent>

            {question.isAnswered && !isEditing && (
                <CardFooter className="flex-col w-full">
                    <FeedbackSection
                        feedback={question.feedback || ''}
                        stream={question.stream || false}
                        isOpen={question.showFeedback || false}
                        onToggle={() => toggleFeedback(question.id)}
                        isReadOnly={readOnly}
                    />
                </CardFooter>
            )}
        </Card>
    );
}