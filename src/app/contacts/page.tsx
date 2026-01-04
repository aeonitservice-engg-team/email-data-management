'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import {
  Button,
  Card,
  Input,
  Select,
  Badge,
  Spinner,
  useToast,
  ConfirmModal,
} from '@/components/ui';
import { useData } from '@/contexts/DataContext';
import { formatDate, formatNumber, debounce } from '@/lib/utils';
import styles from './page.module.css';

/**
 * Contact interface
 */
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  journal: {
    id: string;
    name: string;
    brand: {
      name: string;
      code: string;
    };
  };
}

/**
 * Brand interface
 */
interface Brand {
  id: string;
  name: string;
  code: string;
}

/**
 * Journal interface for dropdown
 */
interface Journal {
  id: string;
  name: string;
  brand: string;
}

/**
 * Contacts Page
 * 
 * View and manage email contacts.
 */
export default function ContactsPage() {
  const { addToast } = useToast();
  const { brands: cachedBrands, journals: cachedJournals, fetchStats, lastFetched } = useData();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [journalFilter, setJournalFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Temp filter states (before submit)
  const [tempBrandFilter, setTempBrandFilter] = useState('');
  const [tempJournalFilter, setTempJournalFilter] = useState('');
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ensure cached data exists
  useEffect(() => {
    if (!lastFetched) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFetched]);

  // Use cached brands
  useEffect(() => {
    if (cachedBrands.length > 0) {
      setBrands(cachedBrands.map(b => ({ id: b.id, name: b.name, code: b.code })));
    }
  }, [cachedBrands]);

  // Use cached journals and transform for dropdown
  useEffect(() => {
    if (cachedJournals.length > 0) {
      setJournals(cachedJournals.map(j => ({
        id: j.id,
        name: j.name,
        brand: j.brand.name,
      })));
    }
  }, [cachedJournals]);

  // Filter journals based on selected brand
  useEffect(() => {
    if (tempBrandFilter) {
      const brandData = cachedBrands.find(b => b.id === tempBrandFilter);
      const filtered = cachedJournals
        .filter(j => j.brandId === tempBrandFilter)
        .map(j => ({
          id: j.id,
          name: j.name,
          brand: brandData?.name || '',
        }));
      setFilteredJournals(filtered);
      setTempJournalFilter(''); // Reset journal selection when brand changes
    } else {
      setFilteredJournals([]);
      setTempJournalFilter('');
    }
  }, [tempBrandFilter, cachedJournals, cachedBrands]);

  /**
   * Fetch contacts from API
   */
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setHasLoaded(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
      });
      if (search) params.set('search', search);
      if (journalFilter) params.set('journalId', journalFilter);
      if (brandFilter) params.set('brandId', brandFilter);

      const response = await fetch(`/api/contacts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.contacts);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      addToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, journalFilter, brandFilter, addToast]);

  // useEffect(() => {
  //   fetchContacts();
  // }, [fetchContacts]);

  /**
   * Debounced search handler
   */
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 300),
    [],
  );

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  /**
   * Delete contact
   */
  const handleDelete = async () => {
    if (!selectedContact) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      addToast('Contact deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchContacts();
    } catch (error) {
      addToast('Failed to delete contact', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Header
        title="Contacts"
        description={`View all email contacts (${formatNumber(total)} total)`}
      />

      {!hasLoaded && (
        <Card>
          <div className={styles.loadPrompt}>
            <svg className="w-14 h-14 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Load Email Contacts</h3>
              <p className="text-base text-neutral-600">View and manage your collected email contacts</p>
            </div>
            <Button onClick={() => fetchContacts()}>
              Load Contacts
            </Button>
          </div>
        </Card>
      )}

      {hasLoaded && (
      <Card noPadding>
        <div className={styles.filters}>
          <Input
            placeholder="Search by name or email..."
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          <Select
            options={[
              { value: '', label: 'All Brands' },
              ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
            ]}
            value={tempBrandFilter}
            onChange={(e) => setTempBrandFilter(e.target.value)}
          />
          <Select
            options={[
              { value: '', label: tempBrandFilter ? 'Select Journal' : 'Select Brand First' },
              ...filteredJournals.map((j) => ({ value: j.id, label: j.name })),
            ]}
            value={tempJournalFilter}
            onChange={(e) => setTempJournalFilter(e.target.value)}
            disabled={!tempBrandFilter}
          />
          <Button
            onClick={() => {
              setBrandFilter(tempBrandFilter);
              setJournalFilter(tempJournalFilter);
              setPage(1);
            }}
          >
            Submit
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : contacts.length === 0 ? (
          <div className={styles.empty}>
            <p>No contacts found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Journal</th>
                  <th>Brand</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className={styles.nameCell}>{contact.name}</td>
                    <td>
                      <a href={`mailto:${contact.email}`} className={styles.emailLink}>
                        {contact.email}
                      </a>
                    </td>
                    <td>{contact.phone || '-'}</td>
                    <td className={styles.journalCell}>{contact.journal.name}</td>
                    <td>
                      <Badge variant={contact.journal.brand.code === 'GMX' ? 'primary' : 'secondary'}>
                        {contact.journal.brand.name}
                      </Badge>
                    </td>
                    <td>{formatDate(contact.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButtonDanger}
                          onClick={() => handleDeleteClick(contact)}
                          aria-label="Delete contact"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete the contact "${selectedContact?.email}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
